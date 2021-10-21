const { SlashCommandBuilder } = require('@discordjs/builders');
const mariadb = require('mariadb');
const logger = require("../util/logger.js");
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
let roleid;
let outcome;
let status;
let last_updated;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('judgment')
		.setDescription('Sets a judgment for a submited chart')
        .addStringOption(option => {
            option.setName('chart_id')
                .setDescription("The ID of the chart to use.")
                .setRequired(true)
            return option;
        })
        .addStringOption(option => {
            option.setName('judgment_outcome')
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

        pool.getConnection().then(connection => {
            conn.query(`USE ch_helper;`)
            try {
                conn.query(`SELECT * FROM ch_serverconfig WHERE server_id = ${interaction.guild.id}`).then(result => {
                    if(result[0].reviewer_role_id === '0' && result[0].logchan_id === '0' && result[0].queue_chart_channel === '0') {
                        connection.release()
                        return interaction.editReply("Error: Please set the config for ``reviewer_role_id``, ``logchan_id``, ``queue_chart_channel`` to use this command.")
                    }
                })
                connection.query(`SELECT * FROM ch_serverconfig WHERE server_id = ${interaction.guild.id}`).then(response => {
                    roleid = result[0].reviewer_role_id
                })
                connection.release()
            } catch (error) {
                logger.log(`DB_FetchError: could not fetch role id: ${error}`, warn);
                interaction.editReply(":x: Sorry, I was unable to get the role ID from the database. Please try again later.")
            }
        })
    
        if(!interaction.member.roles.cache.has(roleid)) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true })
        }

        let chartid = interaction.options.get("chart_id")
        let judgment_outcome = interaction.options.get("judgment_outcome")
        let judgment_reason = interaction.options.get("judgment_reason")

        interaction.editReply('Processing judgment for chart ' + chartid + "... This may take a moment.')")

        // process

        pool.getConnection()
        .then(conn => {
            conn.query(`SELECT EXISTS(SELECT * FROM ch_chartqueue WHERE chart_id = "${chartid}"`).then(result => {
                let resarr = Object.values(result[0])
                if(resarr[0] === 0) {
                   return interaction.editReply(`That chartID (${chartid}) does not exist in the database. Please try again.`)
                }
            })
            interaction.editReply("Chart exists in the database, updating record..")
            switch(judgment_outcome) {
                case "approve_chart": 
                    outcome = "Chart Approved."
                    status = "Approved."
                    last_updated = Date.now()
                    break
                case "deny_chart": 
                    outcome = "Chart denied."
                    status = "Denied."
                    last_updated = Date.now()
                    break
                case "request_resubmit": 
                    outcome = "Chart resubmsion required."
                    status = "Resubmit Required."
                    last_updated = Date.now()
                    break
                default: 
                    return interaction.editReply("Error: Unknown outcome was sent to switch(), please try again.")
            }
            try {
                conn.query(`UPDATE ch_chartqueue SET status = "${status}" , last_updated = "${last_updated}", judgment_reason = "${judgment_reason}", judgment_outcome = "${judgment_outcome}" WHERE chart_id = "${chartid}"`)   
            } catch (error) {
                return interaction.editReply(`Error processing ${chartid}. Please contact sticks.`)
            }

        })

	},
};