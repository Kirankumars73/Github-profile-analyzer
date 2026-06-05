'use strict';

require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = parseInt(process.env.PORT) || 3000;

// Auto-create table on startup so no manual schema.sql run needed on Railway
async function initDb() {
  const sql = `
    CREATE TABLE IF NOT EXISTS github_profiles (
      id                INT PRIMARY KEY AUTO_INCREMENT,
      username          VARCHAR(100) NOT NULL UNIQUE,
      name              VARCHAR(200),
      bio               TEXT,
      location          VARCHAR(200),
      avatar_url        VARCHAR(500),
      github_url        VARCHAR(500),
      public_repos      INT DEFAULT 0,
      public_gists      INT DEFAULT 0,
      followers         INT DEFAULT 0,
      following         INT DEFAULT 0,
      top_language      VARCHAR(100),
      account_age_days  INT,
      repos_per_year    FLOAT,
      github_created_at DATETIME,
      analyzed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.execute(sql);
    console.log('✅  Database table ready.');
  } catch (err) {
    console.error('❌  DB init error:', err.message);
  }
}

initDb().then(() => {
  console.log('[server] process.env.PORT =', process.env.PORT);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀  GitHub Profile Analyzer running on 0.0.0.0:${PORT}`);
    console.log(`    Health: http://localhost:${PORT}/api/health`);
  });
});
