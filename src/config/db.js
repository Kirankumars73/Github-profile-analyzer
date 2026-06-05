'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Parse a mysql:// connection URL into a pool config object.
 * mysql2's createPool(urlString) doesn't accept extra options,
 * so we parse manually and merge in ssl + pool settings.
 */
function parseUrl(rawUrl) {
  const u = new URL(rawUrl);
  return {
    host:     u.hostname,
    port:     parseInt(u.port) || 3306,
    user:     decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  };
}

const baseConfig = process.env.MYSQL_URL
  ? parseUrl(process.env.MYSQL_URL)
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'github_analyzer',
    };

const pool = mysql.createPool({
  ...baseConfig,
  ssl:              { rejectUnauthorized: false }, // required for Railway MySQL 9.x
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

module.exports = pool;
