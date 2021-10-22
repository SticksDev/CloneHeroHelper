const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const mariadb = require('mariadb');
const logger = require("../util/logger.js");
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkstatus')
		.setDescription('Checks a submitted charts status.')
        .addStringOption(option => {
            option.setName('chart_id')
                .setDescription("The ID of the chart to use.")
                .setRequired(true)
            return option;
        }),
	async execute(interaction, client) {
		await interaction.deferReply();
		let chartid = interaction.options.get("chart_id")
        
        pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
        let connection = await pool.getConnection()
        connection.query(`USE ch_helper`)
        await connection.query(`SELECT * FROM ch_chartqueue WHERE chart_id = '${chartid.value}'`).then(response => {
            const outcomeembed = new MessageEmbed()
            .setTitle(`Chart status: ${chartid.value}`)
            .addFields(
                {name: "Outcome", value: response[0].judgement_outcome},
                {name: "Chart Status", value: response[0].status},
                {name: "Reason", value: response[0].judgement_reason},
                {name: "Last Updated", value: response[0].last_updated},
                {name: "Processed by", value: response[0].ProcessedBy}
            )
            .setColor("BLUE")
            .setTimestamp()
            interaction.editReply({embeds: [outcomeembed]})
        })
        connection.release()
        pool.end()
	},
};