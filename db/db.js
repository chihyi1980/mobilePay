const mariadb = require('mariadb');
let config = require('../config/config');

const pool = mariadb.createPool(config.DB_config_DEV);

module.exports = pool;