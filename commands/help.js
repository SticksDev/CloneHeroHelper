const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show's the help menu"),
    
    async execute(interaction, client) {
      
    const Invite = new MessageEmbed()
        .setTitle("Help - Commands List")
        .setDescription("/config (option) (new_value) - sets a config value \n /configcheck - check's the server's config. \n /sendchart - starts the chart wizard \n /checkstats (chartid) - checks the status of the chardID. \n /judgement (id) (action) (reason) - sets the chart to that action \n /ping - Pong? \n /invite - invite for the bot \n /stats - shows's the bots stats.")
        .setColor("BLUE")
        .setThumbnail(client.user.displayAvatarURL())

      let row = new MessageActionRow().addComponents(
        new MessageButton()
          .setURL("https://discord.gg/UY9bjyfGQx")
          .setLabel("Support Server")
          .setStyle("LINK"),

      );
      
      interaction.reply({ embeds: [Invite], components: [row] });
    }
  };