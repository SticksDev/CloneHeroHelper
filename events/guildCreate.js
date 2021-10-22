const logger = require("../util/logger.js");
const mariadb = require('mariadb');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
let owner;
module.exports = {
	name: 'guildCreate',
    execute(guild, client) {
        pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
	owner = guild.ownerId
        logger.log(`[GUILD JOIN] ${guild.id} added the bot. Owner: ${guild.ownerId}`, "log");
        logger.log(`Processing setup tasks for ${guild.id}...`, "log");
        // Create default row 
        pool.getConnection().then(connection => {
            try {
                connection.query("USE ch_helper;")
                connection.query(`INSERT INTO ch_serverconfig(server_id, queue_chart_channel, logchan_id, reviewer_role_id) VALUES(${guild.id}, 0, 0, 0);`)
                connection.release()
            } catch (error) {
                logger.log("Could not create new config DB for serverID: " + guild.id + ": " + error.message, "warn")
            }
        })
        const Invite = new MessageEmbed()
            .setTitle("👋 Thank's for inviting me!")
            .setDescription("Here is some usefull information about me. Enjoy the bot!")
            .setColor("BLUE")
            .setThumbnail(client.user.displayAvatarURL())
        
        let row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setURL("https://github.com/Thatcooldevguy/CloneHeroHelper/tree/master/docs/getting_started.md")
                  .setLabel("Getting Started Guide")
                  .setStyle("LINK"),
        
                new MessageButton()
                  .setURL("https://discord.gg/UY9bjyfGQx")
                  .setLabel("Support Server")
                  .setStyle("LINK"),
        
        );

        const generalChannel = guild.channels.cache.find((channel) => channel.name === "general");
        if (generalChannel) {
            generalChannel.send({ embeds: [Invite], components: [row] });
        } else {
            client.users.cache.get(owner).send(":x: Oops, I couldn't find a channel to send the welcome message in. I'll send it here!");
            client.users.cache.get(owner).send({ embeds: [Invite], components: [row] });
        }
        logger.log(`Setup complete for ${guild.id}.`, "log");

        setTimeout(() => {
            pool.end()
        }, 5000);
    }   
};
