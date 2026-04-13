-- ================================================================
-- Enhanced Family Tree Schema - MySQL 5.x Compatible
-- Photos, Stories, Relationships, Events, Privacy
-- ================================================================

USE family_tree;

-- ─── Stories/Memories Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('life_event', 'achievement', 'migration', 'war', 'family_tradition', 'other') DEFAULT 'other',
  year VARCHAR(10) DEFAULT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member(member_id),
  INDEX idx_category(category),
  INDEX idx_created(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Relationships Table (Spouses, Siblings, etc) ──────────────
CREATE TABLE IF NOT EXISTS relationships (
  id INT NOT NULL AUTO_INCREMENT,
  member1_id INT NOT NULL,
  member2_id INT NOT NULL,
  relationship_type ENUM('spouse', 'partner', 'sibling', 'half_sibling', 'adoptive') NOT NULL,
  start_year VARCHAR(10) DEFAULT NULL,
  end_year VARCHAR(10) DEFAULT NULL,
  notes TEXT,
  added_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member1_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (member2_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member1(member1_id),
  INDEX idx_member2(member2_id),
  INDEX idx_type(relationship_type),
  UNIQUE KEY unique_relationship (member1_id, member2_id, relationship_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Events Table (Births, Deaths, Marriages, etc) ─────────────
CREATE TABLE IF NOT EXISTS events (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT DEFAULT NULL,
  event_type ENUM('birth', 'death', 'marriage', 'migration', 'achievement', 'other') NOT NULL,
  event_date DATE DEFAULT NULL,
  event_year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) DEFAULT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member(member_id),
  INDEX idx_type(event_type),
  INDEX idx_date(event_date),
  INDEX idx_year(event_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Photos Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  caption TEXT,
  year VARCHAR(10) DEFAULT NULL,
  is_profile_photo BOOLEAN DEFAULT FALSE,
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member(member_id),
  INDEX idx_profile(is_profile_photo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Documents Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id INT NOT NULL AUTO_INCREMENT,
  member_id INT NOT NULL,
  document_type ENUM('birth_certificate', 'death_certificate', 'marriage_certificate', 'photo', 'letter', 'other') NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  document_date DATE DEFAULT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member(member_id),
  INDEX idx_type(document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Reminders/Notifications Table ─────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id INT NOT NULL AUTO_INCREMENT,
  reminder_type ENUM('birthday', 'death_anniversary', 'marriage_anniversary', 'custom') NOT NULL,
  member_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  reminder_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  email_recipients TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member(member_id),
  INDEX idx_date(reminder_date),
  INDEX idx_active(is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── User Preferences Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT NOT NULL AUTO_INCREMENT,
  user_identifier VARCHAR(255) NOT NULL UNIQUE,
  default_language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'dark',
  email_notifications BOOLEAN DEFAULT TRUE,
  privacy_mode ENUM('all', 'family_only', 'private') DEFAULT 'family_only',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user (user_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Statistics Cache Table (for performance) ──────────────────
CREATE TABLE IF NOT EXISTS statistics_cache (
  id INT NOT NULL AUTO_INCREMENT,
  stat_key VARCHAR(100) NOT NULL UNIQUE,
  stat_value TEXT NOT NULL,
  last_calculated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_stat (stat_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
-- Success Message
-- ═══════════════════════════════════════════════════════════════
SELECT '✅ New tables created successfully!' AS status;
