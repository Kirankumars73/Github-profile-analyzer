# GitHub Profile Analyzer API

A REST API that fetches GitHub user profile data via the GitHub public API, computes useful insights, and persists results in MySQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | MySQL (v8+) |
| External API | GitHub REST API v3 |
| HTTP Client | axios |
| Config | dotenv |
| Dev Tooling | nodemon |

---

## Setup Instructions (Local)

```bash
# 1. Clone and install dependencies
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer
cd github-profile-analyzer
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials and optional GitHub token

# 3. Create the database
mysql -u root -p < sql/schema.sql

# 4. Start development server
npm run dev
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port (default: 3000) |
| `DB_HOST` | Yes | MySQL host (default: localhost) |
| `DB_PORT` | No | MySQL port (default: 3306) |
| `DB_USER` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_NAME` | Yes | Database name (default: github_analyzer) |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token — raises rate limit from 60 to 5000 req/hr |

---

## API Endpoints

### `POST /api/analyze/:username`
Fetches the GitHub profile for `username`, computes insights, stores/updates in MySQL.
Returns cached data if analyzed within the last hour.

```bash
curl -X POST http://localhost:3000/api/analyze/torvalds
```

**Response 200:**
```json
{
  "username": "torvalds",
  "name": "Linus Torvalds",
  "public_repos": 8,
  "followers": 230000,
  "top_language": "C",
  "account_age_days": 4800,
  "repos_per_year": 0.6,
  "analyzed_at": "2025-06-05T10:00:00.000Z"
}
```

**Response 404** — GitHub user not found  
**Response 429** — GitHub rate limit exceeded (includes `Retry-After` header)

---

### `GET /api/profiles`
Returns all stored profiles, newest first.

**Query params (optional):**
- `limit` — number of results (default 20, max 100)
- `offset` — pagination offset (default 0)

```bash
curl "http://localhost:3000/api/profiles?limit=10&offset=0"
```

---

### `GET /api/profiles/:username`
Returns the stored profile for one user.

```bash
curl http://localhost:3000/api/profiles/torvalds
```

**Response 404** if username has not been analyzed yet.

---

### `DELETE /api/profiles/:username`
Removes a stored profile from the database.

```bash
curl -X DELETE http://localhost:3000/api/profiles/torvalds
```

**Response 200:**
```json
{ "message": "Profile deleted." }
```

---

### `GET /api/health`
Returns server and database status. Useful for deployment health checks.

```bash
curl http://localhost:3000/api/health
```

**Response 200:**
```json
{ "status": "ok", "db": "connected", "uptime": 1234 }
```

---

## Database Schema

```sql
CREATE TABLE github_profiles (
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
);
```

---

## Live API URL

_Add your deployed URL here after deploying._

---

## Author

_Your name here_
