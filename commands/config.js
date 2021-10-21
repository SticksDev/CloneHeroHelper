const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js')
const mariadb = require('mariadb');
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
let config_option;
let newval;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('sets config options')
        .addStringOption(option => {
            option.setName('config_option')
                .setDescription("Choose the option the change. Set to view to view_all options.")
                .addChoice("Chart queue channel", "queue_chart_channel")
                .addChoice("Reviewer Role ID", "reviewer_role_id")
                .addChoice("Loging Channel ID", "logchan_id")
                .addChoice("View all options", "view_all")
                .setRequired(true)
            return option;
        })
        .addStringOption(option => {
            option.setName('new_value')
                .setDescription("The value to set it to.")
                .setRequired(false)
            return option;
        }),
    async execute(interaction, client) {
        // ensure pool is created
        pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
        const config_options = new discord.MessageEmbed()
            .setTitle("Configuration Help")
            .addFields(
                {name: 'Chart queue channel (queue_chart_channel)', value: "The channel ID to post new charts needing approval. "},
                {name: 'Loging Channel ID (logchan_id)', value: "The ID of the channel that actions should be logged in."},
                {name: 'Reviewer Role ID (reviewer_role_id)', value: "The roleID of the people that are allowed to aprove/deny charts."}
            )
            .setColor("BLUE")
        await interaction.deferReply();
        let choice = interaction.options.get("config_option")
        let updatedval = interaction.options.get("new_value")
        
        if(choice.value === "view_all") {
            return interaction.editReply({embeds: [config_options]})
        }

        // do the options check here, as we already checked for the help menu.
        if(!updatedval) {
            return interaction.editReply(":x: Error, a new value is required.")
        }

        switch(choice.value) {
            case "queue_chart_channel":
                pool.getConnection().then(conn => {
                    conn.query(`USE ch_helper;`)
                    try {
                        conn.query(`UPDATE ch_serverconfig SET queue_chart_channel = ${updatedval.value} WHERE server_id = ${interaction.guild.id};`).then((res) => {console.log(res)})
                        interaction.editReply(`:white_check_mark: Sucessfully updated queue_chart_channel to ${updatedval.value}`)
                    } catch (err) {
                        interaction.editReply(":x: Unable to update server config (DB_ERROR). Please contact sticks.")
                        return logger.log("DBError: "+ err.message, "warn");
                    }
                    conn.release()
                })
                break
            case "logchan_id": 
                pool.getConnection().then(conn => {
                    conn.query(`USE ch_helper;`)
                    try {
                        conn.query(`UPDATE ch_serverconfig SET logchan_id = ${updatedval.value} WHERE server_id = ${interaction.guild.id};`)
                        interaction.editReply(`:white_check_mark: Sucessfully updated logchan_id to ${updatedval.value}`)
                    } catch (err) {
                        interaction.editReply(":x: Unable to update server config (DB_ERROR). Please contact sticks.")
                        return logger.log("DBError: "+ err.message, "warn");
                    }    
                    conn.release()
                })
                break
            case "reviewer_role_id":
                pool.getConnection().then(conn => {
                    conn.query(`USE ch_helper;`)
                    try {
                        conn.query(`UPDATE ch_serverconfig SET reviewer_role_id = ${updatedval.value} WHERE server_id = ${interaction.guild.id};`)
                        interaction.editReply(`:white_check_mark: Sucessfully updated reviewer_role_id to ${updatedval.value}`)
                    } catch (err) {
                        interaction.editReply(":x: Unable to update server config (DB_ERROR). Please contact sticks.")
                        return logger.log("DBError: "+ err.message, "warn");
                    }
                    conn.release()
                })
                break
            default:
                interaction.editReply(":x: Error, there was an interaction error while proceesing your choice. Please try again.")
        }
        setTimeout(() => {
            pool.end()
        }, 5000)
    }
}