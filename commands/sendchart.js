const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
let msgcollection;
const mariadb = require('mariadb');
const logger = require("../util/logger.js");
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});

module.exports = {
	data: new SlashCommandBuilder()
		.setName("sendchart")
		.setDescription("Sends a chart to the streamer!"),
	async execute(interaction, client) {
		await interaction.deferReply();
		const selectmenu = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId("select")
				.setPlaceholder("Nothing selected")
				.addOptions([
					{
						label: "Send a chart",
						description: "Send a chart to the streamer!",
						value: "send_chart",
					},
					{
						label: "Check Status of sent chart",
						description: "Check the status of the sent chart.",
						value: "check_status",
					},
				])
		);
        const buttonrow_sendchart = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('google_drive')
                .setLabel('Google Drive Link')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('message_attachment')
                .setLabel("Message Attachment")
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('yt_link')
                .setLabel("Youtube Link")
                .setStyle('SECONDARY'),
        );
        pool.getConnection()
        .then(conn => {
            conn.query("USE ch_helper;")
            conn.query(`SELECT * FROM ch_serverconfig WHERE server_id = ${interaction.guild.id}`).then(result => {
                if(result[0].reviewer_role_id === '0' && result[0].logchan_id === '0' && result[0].queue_chart_channel === '0') {
                    return interaction.editReply("Error: Please set the config for ``reviewer_role_id``, ``logchan_id``, ``queue_chart_channel`` to use this command.")
                } else {
                    interaction.editReply({
                        content: ":warning: Pleas ensure your config is correct before using this command. \n Choose what you would like to do.",
                        components: [selectmenu],
                    });
                }
            })
        })

        const filter = interaction => {
            interaction.deferUpdate();
            return interaction.user.id === interaction.user.id;
        };
        
        const selectlisner = interaction.channel.createMessageComponentCollector({ filter, time: 150000 });
        
        selectlisner.on('collect', i => {
           if(!i.values) {
            switch (i.customId) {
                case "google_drive":
                    interaction.editReply({content: "Please send the google drive link in the next message.", components: []})
                    break
                case "yt_link":
                    interaction.editReply({content: "Please send the youtube link in the next message.", components: []})
                    break
                case "message_attachment":
                    interaction.editReply({content: "Upload using discord's message attachment function (the plus button)", components: []})
                    break
                default:
                    interaction.editReply({content: "Error: seems like there was an unknown case thrown. Please try again.", components: []})
             }   
            } else {
                if (i.values[0] === "send_chart") {
                    interaction.editReply({content: "Please choose the way you'd like to send a chart.",  components: [buttonrow_sendchart]});
                } else if (i.values[0] === "check_status") {
                    interaction.editReply({content: "Please use the /checkstatus command with the ID to check the status of your request.", components: []})
                }
            }
        })
	},
};
