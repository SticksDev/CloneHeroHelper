const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
let msgcollection;

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
		await interaction.editReply({
			content: "Choose what you would like to do.",
			components: [selectmenu],
		});

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
                case "yt_link":
                    interaction.editReply({content: "Please send the youtube link in the next message.", components: []})
                case "message_attachment":
                    interaction.editReply({content: "Upload using discord's message attachment function (the plus button)", components: []})
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
