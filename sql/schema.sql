-- GitHub Profile Analyzer — Database Schema
-- Run: mysql -u root -p < sql/schema.sql

CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

CREATE TABLE IF NOT EXISTS github_profiles (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  username          VARCHAR(100) NOT NULL UNIQUE,
  name              VARCHAR(200),
  bio               TEXT,
  location          VARCHAR(200),
  avatar_url        VARCHAR(500),
  github_url        VARCHAR(500),

  -- Core stats from GitHub
  public_repos      INT DEFAULT 0,
  public_gists      INT DEFAULT 0,
  followers         INT DEFAULT 0,
  following         INT DEFAULT 0,

  -- Computed insights
  top_language      VARCHAR(100),
  account_age_days  INT,
  repos_per_year    FLOAT,

  -- Metadata
  github_created_at DATETIME,
  analyzed_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
