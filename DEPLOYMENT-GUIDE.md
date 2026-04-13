# 🚀 Family Tree Application - Deployment Guide

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure you've completed these steps:

### 1. Security Configuration

- [ ] Change `ADMIN_PASSWORD` in `.env` to a strong, unique password
- [ ] Set `ALLOWED_ORIGINS` to your production domain(s)
- [ ] Generate and set `SESSION_SECRET` using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Verify `.env` is in `.gitignore` and NOT committed to git
- [ ] Review and update CORS settings in `server.production.js`

### 2. Database Setup

- [ ] Run database migration:
  ```bash
  node run-migration.js
  ```
- [ ] Verify all tables exist:
  ```sql
  SHOW TABLES;
  DESCRIBE members;
  DESCRIBE photos;
  DESCRIBE change_requests;
  ```
- [ ] Create database backup:
  ```bash
  mysqldump -u root -p family_tree > backup-$(date +%Y%m%d).sql
  ```

### 3. Dependencies

- [ ] Install production dependencies:
  ```bash
  npm install --production
  ```
- [ ] Verify no vulnerabilities:
  ```bash
  npm audit
  ```

### 4. File Permissions

- [ ] Ensure upload directories exist:
  ```bash
  mkdir -p uploads/photos
  chmod 755 uploads uploads/photos
  ```
- [ ] Verify server can write to uploads directory

### 5. Testing

- [ ] Run endpoint tests:
  ```bash
  node test-endpoints.js
  ```
- [ ] Test in browser:
  - Add a member
  - Upload a photo
  - Export backup
  - Test admin mode
  - Verify statistics load
  - Check timeline view

---

## 📦 Deployment Options

### Option 1: VPS/Cloud Server (Recommended for Production)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- MySQL 8.0+
- Nginx (for reverse proxy)
- PM2 (for process management)
- SSL certificate (Let's Encrypt)

#### Steps

1. **Clone Repository**
   ```bash
   cd /var/www
   git clone <your-repo-url> family-tree
   cd family-tree
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Update all values:
   ```env
   DB_HOST=localhost
   DB_USER=family_tree_user
   DB_PASSWORD=<strong-password>
   DB_NAME=family_tree
   PORT=3000
   NODE_ENV=production
   ADMIN_PASSWORD=<strong-admin-password>
   ALLOWED_ORIGINS=https://yourdomain.com
   SESSION_SECRET=<generated-secret>
   ```

4. **Set Up Database**
   ```bash
   # Create database and user
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE family_tree CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'family_tree_user'@'localhost' IDENTIFIED BY '<strong-password>';
   GRANT ALL PRIVILEGES ON family_tree.* TO 'family_tree_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```
   
   ```bash
   # Run schema
   mysql -u root -p family_tree < schema.sql
   
   # Or if migrating from v1.0
   node run-migration.js
   ```

5. **Set Up PM2**
   ```bash
   npm install -g pm2
   pm2 start server.production.js --name family-tree
   pm2 save
   pm2 startup
   ```
   Follow the command PM2 outputs to enable auto-start on boot.

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/family-tree
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Increase upload size for photos
       client_max_body_size 10M;
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/family-tree /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **Set Up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

8. **Verify Deployment**
   ```bash
   pm2 status
   pm2 logs family-tree
   curl http://localhost:3000/health
   ```

---

### Option 2: Railway.app (Easiest for Beginners)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add MySQL Database**
   - In your project, click "+ New"
   - Select "Database" → "MySQL"
   - Railway will auto-generate credentials

4. **Set Environment Variables**
   Go to your web service → Variables tab:
   ```
   DB_HOST = <from Railway MySQL>
   DB_PORT = <from Railway MySQL>
   DB_USER = root
   DB_PASSWORD = <from Railway MySQL>
   DB_NAME = railway
   PORT = 3000
   NODE_ENV = production
   ADMIN_PASSWORD = <your-strong-password>
   ALLOWED_ORIGINS = https://<your-railway-domain>.railway.app
   SESSION_SECRET = <generated-secret>
   ```

5. **Deploy Database Schema**
   - Connect to Railway MySQL using their shell
   - Paste contents of `schema.sql`
   - Or use MySQL client:
     ```bash
     mysql -h <railway-host> -P <port> -u root -p railway < schema.sql
     ```

6. **Deploy**
   - Railway auto-deploys on git push
   - Your app will be live at: `https://<your-app>.railway.app`

---

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create your-family-tree
   ```

3. **Add MySQL (ClearDB or JawsDB)**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set ADMIN_PASSWORD=<strong-password>
   heroku config:set NODE_ENV=production
   heroku config:set ALLOWED_ORIGINS=https://your-family-tree.herokuapp.com
   heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Run Migration**
   ```bash
   heroku run node run-migration.js
   ```

---

## 🔒 Security Best Practices

### 1. Password Management
- Use password manager to generate strong passwords
- Never reuse passwords between environments
- Rotate admin password quarterly
- Use different passwords for database and admin auth

### 2. SSL/HTTPS
- **Always use HTTPS in production**
- Use Let's Encrypt for free SSL certificates
- Enable HSTS headers
- Redirect all HTTP to HTTPS

### 3. Database Security
- Use separate database user (not root) for application
- Grant only necessary privileges
- Enable MySQL slow query log for monitoring
- Set up regular automated backups

### 4. File Uploads
- Validate file types and sizes
- Scan uploads for viruses (ClamAV)
- Store uploads outside web root if possible
- Set proper file permissions (644 for files, 755 for dirs)

### 5. Monitoring
- Set up error logging (Sentry, LogRocket)
- Monitor server resources (CPU, memory, disk)
- Track failed login attempts
- Set up uptime monitoring (UptimeRobot)

---

## 📊 Post-Deployment Monitoring

### PM2 Commands
```bash
pm2 status              # Check status
pm2 logs family-tree    # View logs
pm2 monit              # Monitor resources
pm2 restart family-tree # Restart app
pm2 reload family-tree  # Zero-downtime restart
```

### Database Backup
Set up daily automated backups:
```bash
# Add to crontab (crontab -e)
0 2 * * * mysqldump -u family_tree_user -p<password> family_tree > /backups/family-tree-$(date +\%Y\%m\%d).sql
```

### Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check logs
pm2 logs family-tree --lines 50

# Common issues:
# - Port already in use: Change PORT in .env
# - Database connection: Verify DB credentials
# - Missing dependencies: Run npm install
```

### Database Connection Errors
```bash
# Test MySQL connection
mysql -u <user> -p<password> -h <host> <database> -e "SELECT 1"

# Check if MySQL is running
sudo systemctl status mysql

# Verify user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'family_tree_user'@'localhost'"
```

### Photo Upload Fails
```bash
# Check directory permissions
ls -la uploads/
chmod 755 uploads uploads/photos

# Check disk space
df -h

# Check file size limits in Nginx
sudo nano /etc/nginx/sites-available/family-tree
# Add: client_max_body_size 10M;
```

### High Memory Usage
```bash
# Check PM2 memory
pm2 status

# Restart if needed
pm2 restart family-tree

# Set memory limit
pm2 start server.production.js --name family-tree --max-memory-restart 500M
```

---

## 🔄 Update Procedure

### Updating to New Version

1. **Backup Everything**
   ```bash
   # Database
   mysqldump -u root -p family_tree > backup-before-update.sql
   
   # Files
   tar -czf files-backup.tar.gz /var/www/family-tree
   ```

2. **Pull Updates**
   ```bash
   cd /var/www/family-tree
   git pull origin main
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Migrations**
   ```bash
   node run-migration.js
   ```

5. **Restart Application**
   ```bash
   pm2 restart family-tree
   ```

6. **Verify**
   ```bash
   pm2 logs family-tree
   node test-endpoints.js
   ```

---

## 📞 Support

- Documentation: See README.md
- Issues: Check CHANGELOG.md
- Tests: Run `node test-endpoints.js`
- Health Check: Visit `/health` endpoint

---

**Last Updated:** April 2026  
**Version:** 2.0.0
