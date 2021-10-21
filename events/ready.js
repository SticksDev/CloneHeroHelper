const logger = require("../util/logger.js");
const mariadb = require('mariadb');
const pool = mariadb.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectionLimit: 5});
module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
    client.user.setActivity(`/help | ${client.guilds.cache.size} Servers`);
    logger.log("CHhelper 1.0 | Running on node version: " + process.version + ".")
    logger.log(`${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");
    logger.log('Checking DB to ensure it is ready to serve.')
    pool.getConnection()
    .then(conn => {
      logger.log("Connected! Checking if ch_helper db exists.")
      conn.query("USE ch_helper;").then(res => {
        logger.log("ch-helper db exists, checking tables!")
      }).catch(err => {
        logger.log('ch-helper db DOES NOT exist! Error: ' + err.message, "error")
        logger.log('Please run the init.sql file to init the db properly.', "error")
        logger.log("Shutting down due to an DBerror in onReady()")
        conn.release();
        pool.end()
        process.exit(1)
      })
      conn.query("SELECT * FROM ch_chartqueue;").then(res => {
        logger.log("ch_chartqueue is OK.")
      }).catch(err => {
        logger.log('Failed to validate tables.. Error: ' + err.message, "error")
        logger.log('Please run the init.sql file to init the db properly.', "error")
        logger.log("Shutting down due to an DBerror in onReady()")
        conn.release();
        pool.end()
        process.exit(1)
      }) 
      conn.query("SELECT * from ch_serverconfig;").then(res => {
        logger.log("ch_serverconfig is OK.")
        logger.log("DB is Ready and connected!", "ready")
      }).catch(err => {
        logger.log('Failed to validate tables.. Error: ' + err.message, "error")
        logger.log('Please run the init.sql file to init the db properly.', "error")
        logger.log("Shutting down due to an DBerror in onReady()")
        conn.release();
        pool.end()
        process.exit(1)
      })
      conn.release()
      pool.end()
    }).catch(err => {
      logger.log('DB is not ready! Error: ' + err.message, "error")
      logger.log("Shutting down due to an DBerror in onReady()")
      pool.end()
      process.exit(1)
    })
    
  }
}
