'use strict';

const pool = require('../config/db');

/**
 * Upsert a profile row.  On duplicate username, all columns are refreshed.
 * @param {Object} profile
 * @returns {Promise<void>}
 */
async function upsert(profile) {
  const sql = `
    INSERT INTO github_profiles
      (username, name, bio, location, avatar_url, github_url,
       public_repos, public_gists, followers, following,
       top_language, account_age_days, repos_per_year,
       github_created_at, analyzed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      name              = VALUES(name),
      bio               = VALUES(bio),
      location          = VALUES(location),
      avatar_url        = VALUES(avatar_url),
      github_url        = VALUES(github_url),
      public_repos      = VALUES(public_repos),
      public_gists      = VALUES(public_gists),
      followers         = VALUES(followers),
      following         = VALUES(following),
      top_language      = VALUES(top_language),
      account_age_days  = VALUES(account_age_days),
      repos_per_year    = VALUES(repos_per_year),
      github_created_at = VALUES(github_created_at),
      analyzed_at       = NOW()
  `;

  await pool.execute(sql, [
    profile.username,
    profile.name,
    profile.bio,
    profile.location,
    profile.avatar_url,
    profile.github_url,
    profile.public_repos,
    profile.public_gists,
    profile.followers,
    profile.following,
    profile.top_language,
    profile.account_age_days,
    profile.repos_per_year,
    profile.github_created_at,
  ]);
}

/**
 * Fetch one profile by username.
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function findByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM github_profiles WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

/**
 * Paginated list of all profiles, newest first.
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Object[]>}
 */
async function listAll(limit = 20, offset = 0) {
  // mysql2 prepared statements don't support LIMIT/OFFSET as bound params reliably.
  // Values are already validated integers from the controller, so inline them safely.
  const [rows] = await pool.query(
    `SELECT * FROM github_profiles ORDER BY analyzed_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
  );
  return rows;
}

/**
 * Delete one profile by username.
 * @param {string} username
 * @returns {Promise<boolean>} true if a row was deleted
 */
async function deleteByUsername(username) {
  const [result] = await pool.execute(
    'DELETE FROM github_profiles WHERE username = ?',
    [username]
  );
  return result.affectedRows > 0;
}

module.exports = { upsert, findByUsername, listAll, deleteByUsername };
