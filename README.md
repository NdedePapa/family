# 🌳 My Family Tree - Version 2.0

> A beautiful, secure, and feature-rich family tree application with photo uploads, statistics, timeline, and collaborative editing.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- 🌲 **Interactive Family Tree** - Beautiful D3.js visualization with zoom & pan
- 📸 **Photo Uploads** - Attach photos to family members with captions
- 📊 **Statistics Dashboard** - View family demographics and generation distribution
- 📅 **Timeline View** - Chronological history of births and deaths
- 🔒 **Admin Mode** - Secure authentication for sensitive operations
- 🌐 **Internationalization** - Multi-language support (English, Twi)
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔄 **Real-time Sync** - Auto-refresh to see changes from other users
- 💾 **Backup/Restore** - Export and import family data
- 🔐 **Security Features** - Rate limiting, input sanitization, CORS protection

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **MySQL** 8.0 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd family-tree-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update with your values:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_secure_password
   DB_NAME=family_tree
   ADMIN_PASSWORD=your_admin_password
   ```

4. **Set up the database**
   
   **For new installations:**
   ```bash
   mysql -u root -p < schema.sql
   ```
   
   **For existing v1.0 databases:**
   ```bash
   mysql -u root -p < database-migration.sql
   ```

5. **Start the server**
   ```bash
   npm start              # Production mode
   # OR
   npm run dev           # Development mode (auto-restart)
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
family-tree-v2/
├── server.production.js      # Main production server (v2.0)
├── server-enhanced.js         # Legacy enhanced server
├── server.js                  # Legacy basic server
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
├── schema.sql                # Complete database schema
├── schema.legacy.sql         # Original v1.0 schema
├── database-migration.sql    # Migration script (v1.0 → v2.0)
├── public/                   # Frontend files
│   ├── index.html           # Main HTML
│   ├── app.js               # Application logic
│   ├── styles.css           # Styling
│   ├── i18n.js              # Translations
│   └── d3.min.js            # D3.js library
├── uploads/                  # Photo storage
│   └── photos/
├── backups/                  # Data backups
└── docs/                     # Documentation

```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_HOST` | MySQL server hostname | Yes | `localhost` |
| `DB_PORT` | MySQL server port | No | `3306` |
| `DB_USER` | MySQL username | Yes | `root` |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | Database name | Yes | `family_tree` |
| `PORT` | Application port | No | `3000` |
| `NODE_ENV` | Environment mode | No | `production` |
| `ADMIN_PASSWORD` | Admin authentication password | Yes | - |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | No | `http://localhost:3000` |
| `SESSION_SECRET` | Session encryption secret | No | Auto-generated |
| `MAX_FILE_SIZE_MB` | Maximum upload size in MB | No | `5` |

### Security Recommendations

⚠️ **IMPORTANT**: Before deploying to production:

1. Change `ADMIN_PASSWORD` to a strong password (12+ characters)
2. Set `ALLOWED_ORIGINS` to your actual domain
3. Generate a random `SESSION_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Never commit `.env` to version control
5. Enable HTTPS in production

---

## 🌍 Deployment

### Option 1: Railway (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add MySQL database service
4. Set environment variables in Railway dashboard
5. Deploy automatically on git push

### Option 2: VPS/Cloud Server

1. Install Node.js and MySQL on your server
2. Clone repository and install dependencies
3. Set up database using `schema.sql`
4. Configure `.env` file
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.production.js --name family-tree
   pm2 save
   pm2 startup
   ```

### Option 3: Docker (Coming Soon)

Docker support will be added in a future release.

---

## 📖 API Documentation

### Health Check
```
GET /health
Response: { ok: true, timestamp: "...", database: "connected" }
```

### Members
```
GET    /api/members           # Get all members
POST   /api/members           # Add new member
PUT    /api/members/:id       # Update member
DELETE /api/members/:id       # Delete member
```

### Photos
```
POST   /api/photos/upload     # Upload photo (multipart/form-data)
GET    /api/photos/:memberId  # Get member's photos
```

### Statistics
```
GET    /api/statistics        # Get family statistics
GET    /api/timeline          # Get chronological timeline
```

### Authentication
```
POST   /api/auth/verify       # Verify admin password
```

### Change Requests
```
GET    /api/change-requests   # Get all change requests
POST   /api/change-requests   # Submit change request
PUT    /api/change-requests/:id  # Resolve request (admin only)
```

---

## 🔒 Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Input Sanitization**: Protects against XSS and SQL injection
- **CORS Protection**: Restricts cross-origin requests
- **Helmet.js**: Sets secure HTTP headers
- **File Upload Validation**: Restricts file types and sizes
- **Password Authentication**: Admin-protected operations
- **Transaction Safety**: Database operations use transactions

---

## 🐛 Troubleshooting

### Database Connection Fails
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"

# Verify credentials in .env
```

### Migration Issues
```bash
# If migration fails, check schema version
mysql -u root -p family_tree -e "DESCRIBE members"

# Re-run migration
mysql -u root -p family_tree < database-migration.sql
```

### Photo Uploads Not Working
```bash
# Ensure uploads directory exists and is writable
mkdir -p uploads/photos
chmod 755 uploads uploads/photos
```

### Port Already in Use
```bash
# Change PORT in .env or kill existing process
lsof -ti:3000 | xargs kill -9
```

---

## 🔄 Migration Guide (v1.0 → v2.0)

If you're upgrading from version 1.0:

1. **Backup your database**
   ```bash
   mysqldump -u root -p family_tree > backup.sql
   ```

2. **Run migration script**
   ```bash
   mysql -u root -p family_tree < database-migration.sql
   ```

3. **Install new dependencies**
   ```bash
   npm install
   ```

4. **Update package.json main file**
   - Now uses `server.production.js`

5. **Restart your server**
   ```bash
   pm2 restart family-tree
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **D3.js** - Data visualization library
- **Express.js** - Web framework
- **MySQL** - Database
- **Helmet.js** - Security middleware
- **Multer** - File upload handling

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ by the NdedePapa Family**
