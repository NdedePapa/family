# Family Tree Application - Changelog

## Version 2.0 - Major Update (April 2026)

### 🌍 **NEW: Multi-Language Support**
- **French Translation** fully implemented alongside English
- Language toggle button (🌐) in header
- Automatic language preference saving
- All UI elements, messages, and prompts translated
- Translation file: `public/i18n.js`

### 🔒 **Security Improvements**
- **Removed hardcoded admin password** from client-side code
- Server-side password verification via `/api/auth/verify` endpoint
- Admin password now configured via `.env` file (`ADMIN_PASSWORD`)
- Secure authentication flow for admin operations

### 📥 **Import/Restore Functionality**
- New Import feature to restore family tree from backup files
- Admin password required for import operations
- Server endpoint: `/api/import` with full validation
- Replaces all data with imported members (with confirmation)

### 🐛 **Bug Fixes**
1. **Connection Status** - Now uses translations dynamically
2. **Toast Messages** - All notifications properly translated
3. **Modal Forms** - Button text updates based on language
4. **Validation** - Improved error messages with translations
5. **Tree Rendering** - Fixed generation label display
6. **Sidebar** - Gender and date formatting with locale support

### 🎨 **UI/UX Improvements**
- Language switcher with flag emoji indicators
- Import button with purple theme
- Better button titles with translations
- Improved hint bar with mobile/desktop detection
- Pills now show translated text

### ⚙️ **Technical Changes**
- **Backend**: Added `/api/auth/verify` and `/api/import` endpoints
- **Frontend**: Modular translation system with `i18n.js`
- **State Management**: Language preference persistence
- **Error Handling**: Better error messages for import/auth failures

### 📦 **New Files**
- `public/i18n.js` - Complete translation dictionary (EN/FR)
- `CHANGELOG.md` - This file

### 🔧 **Modified Files**
- `server.js` - Added authentication and import endpoints
- `public/index.html` - Full translation integration, import modal, security fixes
- `.env.example` - Added `ADMIN_PASSWORD` configuration

### 🌐 **Translation Coverage**
All application text translated including:
- Header and navigation
- Modals (Add, Edit, Import, Export, Help)
- Sidebar information
- Toast notifications
- Form labels and hints
- Confirmation dialogs
- Error messages
- FAQ content

### 📝 **Configuration**
Update your `.env` file with:
```
ADMIN_PASSWORD=YourSecurePasswordHere
```

### 🚀 **Usage**
1. **Switch Language**: Click 🌐 button in header
2. **Import Data**: Click Import button, select backup file, enter admin password
3. **Admin Mode**: Click 🔒, enter password (now server-validated)

### ⚠️ **Breaking Changes**
- Admin password must now be set in `.env` file (defaults to `FamilyTree2026`)
- Import requires admin authentication
- Language preference is auto-saved to localStorage

### 🔄 **Migration Guide**
1. Update `.env` file with `ADMIN_PASSWORD`
2. Restart server to apply changes
3. Clear browser cache if translation doesn't appear
4. Test admin login with new password verification

---

## Previous Versions
See git history for earlier changes.
