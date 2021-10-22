const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const mariadb = require('mariadb');
const logger = require("../util/logger.js");
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionectionLimit: 5});
let roleid;
let outcome;
let status;

const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = date+' | '+time;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('judgement')
		.setDescription('Sets a judgement for a submited chart')
        .addStringOption(option => {
            option.setName('chart_id')
                .setDescription("The ID of the chart to use.")
                .setRequired(true)
            return option;
        })
        .addStringOption(option => {
            option.setName('judgement_outcome')
                .setDescription("Choose the Judgment You'd like to send.")
                .addChoice("Approve Chart", "approve_chart")
                .addChoice("Deny Chart", "deny_chart")
                .addChoice("Request resubmit", "request_resubmit")
                .setRequired(true)
            return option;
        })
        .addStringOption(option => {
            option.setName('judgement_reason')
                .setDescription("The judgement reason.")
                .setRequired(true)
            return option;
        }),
	async execute(interaction, client) {
		await interaction.deferReply();
        pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});

        let connection = await pool.getConnection()
        connection.query(`USE ch_helper;`)
            try {
                await connection.query(`SELECT * FROM ch_serverconfig WHERE server_id = ${interaction.guild.id}`).then(result => {
                    if(result[0].reviewer_role_id === '0' || result[0].logchan_id === '0' || result[0].queue_chart_channel === '0') {
                        return interaction.editReply("Error: Please set the config for ``reviewer_role_id``, ``logchan_id``, ``queue_chart_channel`` to use this command.")
                    }
                })
                await connection.query(`SELECT * FROM ch_serverconfig WHERE server_id = ${interaction.guild.id}`).then(response => {
                    roleid = response[0].reviewer_role_id
                    logchan = response[0].logchan_id;
                })
            } catch (error) {
                logger.log(`DB_FetchError: could not fetch role id: ${error}`, warn);
                interaction.editReply(":x: Sorry, I was unable to get the role ID from the database. Please try again later.")
            }
    
        if(!interaction.member.roles.cache.has(roleid)) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true })
        }

        let chartid = interaction.options.get("chart_id")
        let judgement_outcome = interaction.options.get("judgement_outcome")
        let judgement_reason = interaction.options.get("judgement_reason")

        interaction.editReply('Processing judgment for chart ' + chartid.value + "... This may take a moment.")

        // process

            //FIXME: String interpolation
            let exists = await connection.query(`SELECT EXISTS(SELECT * FROM ch_chartqueue WHERE chart_id = '${chartid.value}');`)
            let resarr = Object.values(exists)
            let resarr2 = Object.values(resarr[0])
            
            if(resarr2[0] === 0) {
               return interaction.editReply(`That chartID (${chartid.value}) does not exist in the database. Please try again.`)
            }
            
            interaction.editReply("Chart exists in the database, updating record..")
            switch(judgement_outcome.value) {
                case "approve_chart": 
                    outcome = "Chart Approved."
                    status = "Approved."
                    break
                case "deny_chart": 
                    outcome = "Chart denied."
                    status = "Denied."
                    break
                case "request_resubmit": 
                    outcome = "Chart resubmsion required."
                    status = "Resubmit Required"
                    break
                default: 
                    return interaction.editReply("Error: Unknown outcome was sent to switch(), please try again.")
            }
            try {
                connection.query(`UPDATE ch_chartqueue SET status = "${status}" , last_updated = "${dateTime}", judgement_reason = "${judgement_reason.value}", judgement_outcome = "${outcome}", ProcessedBy = "${interaction.member.user.tag}" WHERE chart_id = '${chartid.value}';`)  
                await connection.query(`SELECT * FROM ch_chartqueue WHERE chart_id = '${chartid.value}'`).then(response => {
                    // Notify the user of the outcome.
                    let id = response[0].user_id
                    const outcomeembed = new MessageEmbed()
                        .setTitle(`Chart update: ${chartid.value}`)
                        .setDescription("Your chart request has been updated. Please see below for details.")
                        .addFields(
                            {name: "Outcome", value: outcome},
                            {name: "Chart Staus", value: status},
                            {name: "Reason", value: judgement_reason.value},
                            {name: "Last Updated", value: dateTime},
                            {name: "Processed by", value: interaction.member.user.tag}
                        )
                        .setColor("BLUE")
                        .setTimestamp()
                    const outcomeembed2 = new MessageEmbed()
                        .setTitle(`Chart update: ${chartid.value}`)
                        .addFields(
                            {name: "Outcome", value: outcome},
                            {name: "Chart Staus", value: status},
                            {name: "Reason", value: judgement_reason.value},
                            {name: "Last Updated", value: dateTime},
                            {name: "Processed by", value: interaction.member.user.tag}, 
                            {name: "Link", value: response[0].link_address}
                        )
                        .setColor("BLUE")
                        .setTimestamp()
                    let chan1 = interaction.guild.channels.cache.find((channel) => channel.id === logchan);
                    chan1.send({ embeds: [outcomeembed2]})
                    client.users.cache.get(id).send({ embeds: [outcomeembed]})
                })
                interaction.editReply(`Successfully **${status}**, the chart **${chartid.value}**. `)
            } catch (error) {
                interaction.editReply(`Error processing ${chartid.value}. Please contact sticks.`)
                logger.log("DBError: " + error.message, "warn")
            }
            setTimeout(() => {
                connection.release()
                pool.end()
            }, 5000)
	},
};