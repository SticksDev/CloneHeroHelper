const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reboot')
		.setDescription('Restarts the bot'),
	async execute(interaction, client) {
		await interaction.deferReply();
		if(!interaction.member.user.id === "517495640020746250") {
            return interaction.editReply("This command is only for bot owners.");
        }
        interaction.editReply("Rebooting...");
		setTimeout(() => {
			process.exit(0)
		}, 5000)
	},
};