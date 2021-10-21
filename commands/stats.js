const { SlashCommandBuilder } = require('@discordjs/builders');
const discord = require('discord.js')
const time = require("@sapphire/time-utilities");
const durationFormatter = new time.DurationFormatter();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Shows the bots stats'),
	async execute(interaction, client) {
        await interaction.deferReply();
		let infoembed = new discord.MessageEmbed()
            .setTitle("STATISTICS")
            .addFields(
                {name: "Mem Usage", value: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB"},
                {name: "Uptime", value: durationFormatter.format(client.uptime)},
                {name: "Users", value: client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b).toLocaleString()},
                {name: "Servers", value: client.guilds.cache.size.toLocaleString()},
                {name: "Channels", value: client.channels.cache.size.toLocaleString()},
                {name: "DiscordJS Version:", value: discord.version},
                {name: "Node", value: process.version}
            )
            .setColor("BLUE")
        await interaction.editReply({embeds: [infoembed]})
	},
};