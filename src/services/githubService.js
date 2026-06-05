'use strict';

const axios = require('axios');

// Build axios headers — add GitHub token when available to raise rate limit to 5000/hr
function buildHeaders() {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * Determine the most-used programming language across a user's repositories.
 * Tallies the `language` field on each repo (top 100 by push date).
 * @param {string} username
 * @returns {Promise<string|null>}
 */
async function getTopLanguage(username) {
  const { data: repos } = await axios.get(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { headers: buildHeaders() }
  );

  const tally = {};
  for (const repo of repos) {
    if (repo.language) {
      tally[repo.language] = (tally[repo.language] || 0) + 1;
    }
  }

  const sorted = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
  return sorted[0] || null;
}

/**
 * Compute how many days have passed since the account was created.
 * @param {string} createdAt — ISO date string from GitHub
 * @returns {number}
 */
function accountAgeDays(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt)) / 86_400_000);
}

/**
 * Normalised productivity signal: public repos per year of account lifetime.
 * @param {number} publicRepos
 * @param {number} ageDays
 * @returns {number}
 */
function reposPerYear(publicRepos, ageDays) {
  const years = ageDays / 365;
  return years > 0 ? +(publicRepos / years).toFixed(2) : 0;
}

/**
 * Fetch a GitHub user profile and compute insights.
 * Throws an AxiosError so the controller can inspect response.status.
 * @param {string} username
 * @returns {Promise<Object>} Flat profile object ready to upsert into MySQL
 */
async function analyzeProfile(username) {
  const headers = buildHeaders();

  // 1. Core user data
  const { data: user } = await axios.get(
    `https://api.github.com/users/${username}`,
    { headers }
  );

  // 2. Computed insights
  const ageDays = accountAgeDays(user.created_at);
  const topLang = await getTopLanguage(username);

  return {
    username: user.login,
    name: user.name || null,
    bio: user.bio || null,
    location: user.location || null,
    avatar_url: user.avatar_url || null,
    github_url: user.html_url || null,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    top_language: topLang,
    account_age_days: ageDays,
    repos_per_year: reposPerYear(user.public_repos, ageDays),
    github_created_at: new Date(user.created_at),
  };
}

module.exports = { analyzeProfile };
