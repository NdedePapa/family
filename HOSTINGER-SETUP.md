# 🌐 Hostinger Deployment Setup

## After GitHub Auto-Deploy

Your code auto-deploys from GitHub to Hostinger, but you need to configure environment variables manually.

---

## 🔧 Step 1: Set Environment Variables in Hostinger

### Option A: Via Hostinger Control Panel (Recommended)

1. **Log into Hostinger**
2. **Go to your website dashboard**
3. **Find "Environment Variables"** or **"Node.js Settings"**
4. **Add these variables:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
DB_NAME=your_hostinger_db_name
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=FamilyTree2026
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SESSION_SECRET=your_random_secret_here
```

**IMPORTANT:** Replace:
- `your_hostinger_db_user` - Your Hostinger MySQL username
- `your_hostinger_db_password` - Your Hostinger MySQL password
- `your_hostinger_db_name` - Your database name
- `yourdomain.com` - Your actual domain

---

### Option B: Via SSH (If you have SSH access)

1. **SSH into your Hostinger server**
2. **Navigate to your app folder:**
   ```bash
   cd ~/public_html/your-app-folder
   ```

3. **Create .env file:**
   ```bash
   nano .env
   ```

4. **Paste this (update the values):**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   PORT=3000
   NODE_ENV=production
   ADMIN_PASSWORD=FamilyTree2026
   ALLOWED_ORIGINS=https://yourdomain.com
   SESSION_SECRET=generate_random_string_here
   ```

5. **Save:** Press `Ctrl+X`, then `Y`, then `Enter`

6. **Restart app:**
   ```bash
   pm2 restart all
   # or
   pm2 restart family-tree
   ```

---

## 🔐 Generate Session Secret

Run this locally to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `SESSION_SECRET`.

---

## 🌐 CORS Fix

**Your ALLOWED_ORIGINS must match your exact domain:**

If your site is at `https://family.yourdomain.com`:
```env
ALLOWED_ORIGINS=https://family.yourdomain.com
```

If you have multiple domains:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://family.yourdomain.com
```

**No trailing slashes!** ❌ `https://yourdomain.com/`  
**Correct:** ✅ `https://yourdomain.com`

---

## 🗄️ Database Setup on Hostinger

1. **Create MySQL database** in Hostinger control panel
2. **Import your schema:**
   ```bash
   mysql -u your_user -p your_database < schema.sql
   ```
   
3. **Or use phpMyAdmin:**
   - Go to phpMyAdmin in Hostinger
   - Select your database
   - Click "Import"
   - Upload `schema.sql`

---

## ✅ After Configuration

1. **Restart your Node.js app** (usually automatic or via PM2)
2. **Test password:** `FamilyTree2026`
3. **Test photo upload:** Should work without CORS error

---

## 🆘 Troubleshooting

### Still getting "Wrong Password"?
- Check environment variables are set correctly
- Restart the app
- Check logs for errors

### Still getting CORS error?
- Make sure `ALLOWED_ORIGINS` matches your EXACT domain
- Include both `https://yourdomain.com` AND `https://www.yourdomain.com`
- No trailing slashes
- Restart app after changing

### Database connection error?
- Verify database credentials in Hostinger
- Check database exists
- Verify user has permissions

---

**Need help?** Contact Hostinger support for:
- Where to set environment variables
- How to restart Node.js app
- Database credentials
