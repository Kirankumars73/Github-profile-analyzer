'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

let poolConfig;

try {
  if (process.env.MYSQL_URL) {
    // Parse Railway's MYSQL_URL manually so we can add extra options
    const u = new URL(process.env.MYSQL_URL);
    poolConfig = {
      host:     u.hostname,
      port:     parseInt(u.port) || 3306,
      user:     decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
    };
    console.log('[db] Using MYSQL_URL. Host:', u.hostname);
  } else {
    poolConfig = {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'github_analyzer',
    };
    console.log('[db] Using individual DB_* env vars. Host:', poolConfig.host);
  }
} catch (err) {
  console.error('[db] Failed to parse connection config:', err.message);
  // Fallback to individual vars
  poolConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'github_analyzer',
  };
}

const pool = mysql.createPool({
  ...poolConfig,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

module.exports = pool;
