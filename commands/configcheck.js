const mariadb = require('mariadb');
const logger = require("../util/logger.js");
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js')

let queue_chart_channel;
let logchan_id;
let reviewer_role_id;
let color;
let title;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configcheck')
		.setDescription('Checks server config'),
	async execute(interaction, client) {
        // ensure pool is created
        pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
		await interaction.deferReply();
		pool.getConnection()
        .then(conn => {
            conn.query(`USE ch_helper;`)
            conn.query(`SELECT EXISTS(SELECT * FROM ch_serverconfig WHERE server_id = "${interaction.guild.id}");`).then(result => {
                let resarr = Object.values(result[0])
                if(resarr[0] === 0) {
                    interaction.editReply("No server config found, creating config.")
                    try {
                        conn.query(`INSERT INTO ch_serverconfig(server_id, queue_chart_channel, logchan_id, reviewer_role_id) VALUES(${interaction.guild.id}, 0, 0, 0);`)
                        return interaction.editReply("Server config created. Please change the Chart queue channel, Loging Channel ID, and Reviewer Role ID to use this bot. /config to set options.")
                    } catch (err) {
                        interaction.editReply(":x: Unable to create server config (DB_ERROR). Please contact sticks.")
                        return logger.log("DBError: "+ err.message, "warn");
                    }
                } else {
                    conn.query(`SELECT * FROM ch_serverconfig WHERE server_id = ${interaction.guild.id}`).then(result => {
                        interaction.editReply("Checking config...")
                    
                        if(result[0].queue_chart_channel === '0') {
                            queue_chart_channel = `:x: Fail. queue_chart_channel is set to ${result[0].queue_chart_channel} and this is the default. Please change by using /config.`
                        } else {
                            queue_chart_channel = `:white_check_mark: PASS. queue_chart_channel is set to ${result[0].queue_chart_channel}`
                        }

                        if(result[0].logchan_id === '0') {
                            logchan_id = `:x: Fail. logchan_id is set to ${result[0].logchan_id} and this is the default. Please change by using /config.`
                        } else {
                            logchan_id = `:white_check_mark: PASS. logchan_id is set to ${result[0].logchan_id}`
                        }

                        if(result[0].reviewer_role_id === '0') {
                            reviewer_role_id = `:x: Fail. reviewer_role_id is set to ${result[0].reviewer_role_id} and this is the default. Please change by using /config.`
                        } else {
                            reviewer_role_id = `:white_check_mark: PASS. reviewer_role_id is set to ${result[0].reviewer_role_id}`
                        }

                        if(result[0].reviewer_role_id === '0' && result[0].logchan_id === '0' && result[0].queue_chart_channel === '0') {
                            color = "RED"
                            title = "Configuration Test Output: Fail."
                        } else {
                            color = "YELLOW"
                            title = "Configuration Test Output: Partial Pass."
                        }

                        if(result[0].reviewer_role_id < '0' && result[0].logchan_id < '0' && result[0].queue_chart_channel < '0') {
                            color = "GREEN"
                            title = "Configuration Test Output: Pass."
                        }

                        let output = new discord.MessageEmbed()
                            .setTitle(title)
                            .addFields(
                                {name: "queue_chart_channel", value: queue_chart_channel},
                                {name: "logchan_id", value: logchan_id},
                                {name: "reviewer_role_id", value: reviewer_role_id}
                            )
                            .setColor(color)
                        interaction.editReply({content: "Test complete.", embeds: [output]})
                        conn.release();
                    })
                }
            })
            
        })
        pool.end();
	},
    
};