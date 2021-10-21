const logger = require("../util/logger.js");
const mariadb = require('mariadb');
let pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
module.exports = {
	name: 'guildDelete',
    execute(guild, client) {
        // ensure that pool is available
        pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
        logger.log(`[GUILD LEAVE] ${guild.id} removed the bot. Owner: ${guild.ownerId}`, "log");
        logger.log(`Processing leave tasks for ${guild.id}...`, "log");
        // Create default row 
        pool.getConnection().then(connection => {
            try {
                connection.query("USE ch_helper;")
                connection.query(`DELETE FROM ch_serverconfig WHERE server_id = ${guild.id}`)
                connection.release()
            } catch (error) {
                logger.log("Could not remove config DB for serverID: " + guild.id + ": " + error.message, "warn")
            }
        })
        logger.log(`Leave tasks for ${guild.id} completed.`, "log");

        setTimeout(() => {
            pool.end()
        }, 5000);
    }
};