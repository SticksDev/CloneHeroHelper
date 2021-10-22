const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require("discord.js");
const mariadb = require('mariadb');
const logger = require("../util/logger.js");
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});

let guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'
    return s4() + s4()
}

const today = new Date();
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = date+' | '+time;

let link_type;
let chart_id = guid()

let logchan;
let queuechan;

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
                .setDisabled(true)
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
                if(result[0].reviewer_role_id === '0' || result[0].logchan_id === '0' || result[0].queue_chart_channel === '0') {
                    return interaction.editReply("Error: Please set the config for ``reviewer_role_id``, ``logchan_id``, ``queue_chart_channel`` to use this command.")
                } else {
                    logchan = result[0].logchan_id;
                    queuechan = result[0].queue_chart_channel;
                    interaction.editReply({
                        content: ":warning: Pleas ensure your config is correct before using this command. \n Choose what you would like to do.",
                        components: [selectmenu],
                    });
                }
            })
        })

        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        const filter2 = message => {
            return interaction.user.id === message.user.id
        }
        
        const selectlisner = interaction.channel.createMessageComponentCollector({ filter, time: 150000 });
        const msgcollection = interaction.channel.createMessageCollector({ filter2 , time: 150000, max: 1 });
        
        selectlisner.on('collect', i => {
           if(!i.values) {
            switch (i.customId) {
                case "google_drive":
                    interaction.editReply({content: "Please send the google drive link in the next message.", components: []})
                    link_type = "Google Drive"
                    break
                case "yt_link":
                    interaction.editReply({content: "Please send the youtube link in the next message.", components: []})
                    link_type = "Youtube Link"
                    break
                case "message_attachment":
                    interaction.editReply({content: "Upload using discord's message attachment function (the plus button)", components: []})
                    link_type = "Message Attachment"
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

        msgcollection.on('collect', (msg) => {
            let link_address = msg.content
            msg.delete()
            interaction.editReply("Processing, please wait...")
            // process 
            pool.getConnection().then(conn => {
                conn.query("USE ch_helper;")
                try {
                    conn.query(`INSERT INTO ch_chartqueue(user_id, chart_id, dateSubmitted, link_type, link_address, status, judgement_reason, judgement_outcome, last_updated, ProcessedBy)  VALUES(${interaction.user.id}, "${chart_id}", "${dateTime}", "${link_type}", "${link_address}", "Awaiting Review", "N/A", "N/A", "N/A", "N/A");`).then((rsp) => {
                        let chan1 = interaction.guild.channels.cache.find((channel) => channel.id === logchan);
                        let chan2 = interaction.guild.channels.cache.find((channel) => channel.id === queuechan);
                        const newchart = new MessageEmbed()
                        .setTitle(`New Chart submitted | ${chart_id}`)
                        .addFields(
                            {name: "Chart Status", value: "Awaiting Review"},
                            {name: "Link Type", value: link_type},
                            {name: "Link", value: link_address},
                        )
                        .setColor("BLUE")
                        .setTimestamp()
                        chan1.send(`New chart submitted | ${chart_id} | User ${interaction.member.user.tag} (${interaction.member.id})`)
                        chan2.send({embeds: [newchart]});
                        interaction.editReply("Chart submitted successfully. Please check your direct messages for an ID.")
                        interaction.member.send(`Hey, thanks for submitting your chart. Your chart id is: ${chart_id}. `)
                    })
                } catch (error) {
                    interaction.editReply("Error while processing, please try again later.")
                    logger.log("Failed to process (chart_send): " + error, "error")
                }
            })
        })


	},
};
