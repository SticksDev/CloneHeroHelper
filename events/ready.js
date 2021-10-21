const logger = require("../util/logger.js");
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
    client.user.setActivity(`>help | ${client.guilds.cache.size} Servers`);
    logger.log("CHhelper 1.0 | Running on node version: " + process.version + ".")
    logger.log(`${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");
  }
}
