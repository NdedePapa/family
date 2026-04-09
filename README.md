# 🌳 My Family Tree - Enhanced Edition

A beautiful, interactive family tree application with photo uploads, statistics, and timeline features.

**Tech Stack:** Node.js · Express · MySQL · D3.js · Multermembers.
Built with Node.js + Express + MySQL.

---

## Files in this folder

```
family-tree/
├── server.js          ← The backend (handles all data)
├── package.json       ← Node.js dependencies
├── .env.example       ← Copy to .env and fill in your DB details
├── schema.sql         ← Run this once to set up the database
├── public/
│   └── index.html     ← The frontend (tree visualisation)
└── README.md          ← This file
```

---

## Option A — Host on Railway (easiest, free tier available)

Railway gives you Node.js hosting + MySQL in one place.

### Step 1 — Create a Railway account
Go to https://railway.app and sign up (free).

### Step 2 — Create a new project
- Click **New Project** → **Deploy from GitHub repo**
- Push this folder to a GitHub repo first, then connect it
  OR use **New Project** → **Empty project** and drag-drop the files

### Step 3 — Add a MySQL database
- Inside your Railway project, click **+ New** → **Database** → **MySQL**
- Railway will create the database and show you the connection details

### Step 4 — Run the schema
- Click your MySQL service → **Connect** tab → open the MySQL shell
- Paste the entire contents of `schema.sql` and run it
- You should see: `✅ Seeded 29 members`

### Step 5 — Set environment variables
In your Railway project → your Node.js service → **Variables** tab, add:
```
DB_HOST     = (from Railway MySQL — looks like containers-us-west-xxx.railway.app)
DB_PORT     = (from Railway MySQL — usually 3306 or a custom port)
DB_USER     = root
DB_PASSWORD = (from Railway MySQL)
DB_NAME     = railway
PORT        = 3000
```

### Step 6 — Deploy
Railway auto-deploys when you push to GitHub. Your app will be live at a URL like:
`https://my-family-tree.up.railway.app`

Share that URL with your family — anyone can open it and add members.

---

## Option B — Host on Render (also free)

### Step 1
Go to https://render.com → **New Web Service** → connect your GitHub repo

### Step 2
Create a **New PostgreSQL** database
*(Note: Render uses PostgreSQL, not MySQL. You'd need to adjust the SQL slightly —
or use Render's MySQL-compatible PlanetScale add-on)*

For simplicity, **Railway is recommended** for MySQL.

---

## Option C — Run on your own server (VPS/cPanel)

### Requirements
- Node.js 18+
- MySQL 8.0+

### Setup
```bash
# 1. Upload all files to your server
# 2. Install dependencies
npm install

# 3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update your MySQL credentials and admin password:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=family_tree
   PORT=3000
   ADMIN_PASSWORD=YourSecurePasswordHere
   ```
   ⚠️ **Important**: Change `ADMIN_PASSWORD` to a secure password for production!

To keep it running permanently, use PM2:
```bash
npm install -g pm2
pm2 start server.js --name family-tree
pm2 save
pm2 startup
```

---

## Run locally (for testing)

```bash
# Install Node.js from nodejs.org if you haven't already

# Install dependencies
npm install

# Copy and fill in your .env
cp .env.example .env

# Create database (requires MySQL installed locally)
mysql -u root -p < schema.sql

# Start
npm run dev    # uses nodemon — auto-restarts on file changes
# OR
npm start      # production mode
```

Open http://localhost:3000 in your browser.

---

## How it works for the family

- Anyone with the link can **view** the full tree
- Anyone can **add a new member** (they must enter their own name in "Added By")
- Anyone can **edit** or **delete** members
- The app **auto-refreshes every 30 seconds** — so when one person adds someone,
  everyone else sees it automatically within 30 seconds
- The **Export** button downloads a backup JSON file at any time

---

## API Reference (for developers)

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/members | Get all members |
| POST | /api/members | Add a new member |
| PUT | /api/members/:id | Update a member |
| DELETE | /api/members/:id | Delete a member |
| GET | /health | Server health check |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | MySQL server hostname | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | secret123 |
| DB_NAME | Database name | family_tree |
| PORT | Port the server runs on | 3000 |
