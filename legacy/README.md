# Legacy Files Archive

This folder contains older versions of the application that have been superseded by the current production version.

## Files

### `server.basic.js`
- **Original basic server** (v1.0)
- Basic CRUD operations only
- No photo upload support
- No enhanced features
- **Status:** Deprecated - Use main `server.js` instead

### `server-enhanced.js`
- **Enhanced server** (v1.5)
- Added photo upload capabilities
- Additional member fields
- Statistics and timeline endpoints
- **Status:** Deprecated - Features merged into main `server.js`

### `schema.legacy.sql`
- **Original database schema** (v1.0)
- Basic members and change_requests tables only
- Missing enhanced fields (birth_date, photo_url, etc.)
- **Status:** Use `schema.sql` in root directory for new installations

## Current Production Files

All features from these legacy files have been consolidated into:

**Main Server:** `/server.js`
- Production-ready with all security features
- Rate limiting
- Input sanitization
- Photo upload support
- All enhanced features
- Transaction safety

**Database Schema:** `/schema.sql`
- Complete v2.0 schema
- All tables and enhanced fields
- Performance indexes

**Migration:** `/run-migration.js`
- Upgrades v1.0 databases to v2.0

## Why These Files Are Kept

- **Reference:** For understanding the evolution of the codebase
- **Rollback:** Emergency fallback if needed
- **Documentation:** Shows what changed between versions

## Do Not Use These Files

❌ Do not deploy these to production  
❌ Do not modify these files  
❌ Do not reference in new code  

✅ Use `/server.js` for all deployments  
✅ Use `/schema.sql` for database setup  
✅ Follow current documentation in `/README.md`

---

**Archive Date:** April 13, 2026  
**Current Version:** 2.0.0
