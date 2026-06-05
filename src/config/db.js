'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

// Support Railway's MYSQL_URL connection string OR individual env vars
const pool = process.env.MYSQL_URL
  ? mysql.createPool(process.env.MYSQL_URL)
  : mysql.createPool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'github_analyzer',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

module.exports = pool;
