const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Show's the invite link to this bot."),
    
    async execute(interaction, client) {
      
    const Invite = new MessageEmbed()
        .setTitle("Invite Me! 👋")
        .setDescription("Here's my invie info! Use the buttons below to invite me to your server or join our support server!\n\nStay Safe 👋")
        .setColor("BLUE")
        .setThumbnail(client.user.displayAvatarURL())

      let row = new MessageActionRow().addComponents(
        new MessageButton()
          .setURL("https://discord.com/oauth2/authorize?client_id=900448345724682270&permissions=8&scope=bot%20applications.commands")
          .setLabel("Invite Me")
          .setStyle("LINK"),

        new MessageButton()
          .setURL("https://discord.gg/UY9bjyfGQx")
          .setLabel("Support Server")
          .setStyle("LINK"),

      );
      
      interaction.reply({ embeds: [Invite], components: [row] });
    }
  };