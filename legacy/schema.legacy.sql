-- ================================================================
-- Nana Aku Family Tree — MySQL Schema (Updated April 2026)
-- 92 members · 6 generations + ancestor support (gen 0, -1, -2 …)
-- ================================================================

CREATE DATABASE IF NOT EXISTS family_tree
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE family_tree;

-- ─── Table ───────────────────────────────────────────────────────
-- NOTE: gen uses SMALLINT (not TINYINT) so it can store negative
-- values for ancestors above Nana Aku (gen 0, -1, -2 …)
CREATE TABLE IF NOT EXISTS members (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  gender     VARCHAR(50)  NOT NULL DEFAULT '',
  gen        SMALLINT     NOT NULL,          -- 0=parents, -1=grandparents, 1=Nana Aku, 2+=descendants
  parent_id  INT          DEFAULT NULL,
  birth_year VARCHAR(10)  NOT NULL DEFAULT '',
  death_year VARCHAR(10)  NOT NULL DEFAULT '',
  hometown   VARCHAR(255) NOT NULL DEFAULT '',
  notes      TEXT,
  added_by   VARCHAR(255) NOT NULL DEFAULT '',
  added_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (parent_id) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_gen(gen),
  INDEX idx_parent(parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Change Requests Table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS change_requests (
  id          INT          NOT NULL AUTO_INCREMENT,
  member_id   INT          NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  issue       TEXT         NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending, resolved, dismissed
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP    NULL DEFAULT NULL,
  resolved_by VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_status(status),
  INDEX idx_created(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── If upgrading from old schema: run this once ─────────────────
-- ALTER TABLE members MODIFY COLUMN gen SMALLINT NOT NULL;

-- ─── Seed — 92 members ───────────────────────────────────────────
INSERT IGNORE INTO members
  (id, name, gender, gen, parent_id, birth_year, death_year, hometown, notes, added_by)
VALUES

-- ── Gen 1 — Matriarch ─────────────────────────────────────────────
-- NOTE: Nana Aku's parent can be added as gen 0 via the app,
-- then edit Nana Aku to assign that person as her parent.
(1,  'Nana Aku',                        'Female', 1, NULL, '','','', 'Family matriarch — the root of our tree', ''),

-- ── Gen 2 — Children of Nana Aku ─────────────────────────────────
(2,  'Yaba',                            '', 2, 1,  '','','','',''),
(3,  'Unknown (2)',                      '', 2, 1,  '','','','2nd child of Nana Aku',''),
(4,  'Aduah',                           '', 2, 1,  '','','','3rd child of Nana Aku',''),
(68, '3h3l3 Le gy3ni',                  '', 2, 1,  '','','','',''),
(77, 'Tobia',                           '', 2, 1,  '','','','',''),

-- ── Gen 3 — Grandchildren ────────────────────────────────────────
(5,  'Ama Nyora',                       'Female', 3, 2,  '','','','',''),
(6,  'Raal3 Aya',                       '',       3, 2,  '','','','',''),
(7,  'Georgina (3b3la)',                 'Female', 3, 2,  '','','','',''),
(8,  'Raal3 Ahua Wongara',              '',       3, 2,  '','','','',''),
(9,  'Auntie Adjei',                    '',       3, 2,  '','','','',''),
(76, 'Nana Cudjoe',                     '',       3, 2,  '','','','',''),
(79, 'Sofo Andoh',                      '',       3, 4,  '','','','',''),
(80, 'Sofo Kojo',                       '',       3, 4,  '','','','',''),

-- ── Gen 4 — Great-Grandchildren ──────────────────────────────────
(10, 'Paul Kaku Mensah (Uncle Mienza)', 'Male',   4, 5,  '','','','',''),
(11, 'Mary Efaw Nikte',                 'Female', 4, 5,  '','','','',''),
(12, 'Akua Mienza',                     'Female', 4, 5,  '','','','',''),
(13, 'Joseph Alu Nyanzu',               '',       4, 5,  '','','','',''),
(14, 'Benjamin Kweku Kwamena',          '',       4, 5,  '','','','',''),
(57, 'Nyamek3',                         '',       4, 5,  '','','','',''),
(69, 'Oluman',                          '',       4, 5,  '','','','',''),
(70, 'Wofa Armah',                      '',       4, 5,  '','','','',''),
(15, 'Nreza Assuah',                    '',       4, 6,  '','','','',''),
(16, 'Assuah',                          '',       4, 6,  '','','','',''),
(17, 'Victoria Tandoh (Sister Mother)', 'Female', 4, 7,  '','','','',''),
(18, 'Ajevi',                           '',       4, 7,  '','','','',''),
(19, 'Afriyie',                         '',       4, 8,  '','','','',''),
(20, 'Amina',                           'Female', 4, 8,  '','','','',''),
(21, 'Yaa Abuabo',                      'Female', 4, 8,  '','','','',''),
(22, 'Akos 1',                          'Female', 4, 8,  '','','','',''),
(23, 'Akos 2',                          'Female', 4, 8,  '','','','',''),
(24, 'Adjoa Broni',                     'Female', 4, 8,  '','','','',''),
(25, 'Wofa Yaw',                        'Male',   4, 8,  '','','','',''),
(26, 'Sister Yaba',                     'Female', 4, 9,  '','','','',''),
(27, 'Kojo',                            'Male',   4, 9,  '','','','',''),
(28, 'Akuba',                           'Female', 4, 9,  '','','','',''),
(29, 'Ama Mansa',                       'Female', 4, 9,  '','','','',''),
(81, 'Hannah Cudjoe',                   '',       4, 76, '','','','',''),
(82, 'Anna Cudjoe (Yaba)',              '',       4, 76, '','','','',''),
(83, 'Janet Cudjoe',                    '',       4, 76, '','','','',''),
(84, 'Samuel Cudjoe',                   '',       4, 76, '','','','',''),
(85, 'Aduah',                           '',       4, 76, '','','','',''),

-- ── Gen 5 ────────────────────────────────────────────────────────
(30, 'Gabriel Ekra Armah',              '',       5, 15, '','','','',''),
(31, 'Mosses Armah',                    '',       5, 15, '','','','',''),
(32, 'Chantel Bennie Armah',            '',       5, 15, '','','','',''),
(33, 'Francis Ackah Armah',             '',       5, 15, '','','','',''),
(34, 'Kone',                            '',       5, 15, '','','','',''),
(35, 'Bomo',                            '',       5, 15, '','','','',''),
(36, 'Victoria Coffie',                 '',       5, 15, '','','','',''),
(37, 'Stephanie Coffie',               '',       5, 15, '','','','',''),
(38, 'Albertine Coffie',                '',       5, 15, '','','','',''),
(60, 'Elizabeth Assuah (Nda)',          '',       5, 16, '','','','',''),
(61, 'Patience Assuah (Ndale)',         '',       5, 16, '','','','',''),
(62, 'Frederick Assuah (Enzi Mitian)',  '',       5, 16, '','','','',''),
(63, 'William Assuah (Nana)',           '',       5, 16, '','','','',''),
(64, 'Jacob Assuah',                    '',       5, 16, '','','','',''),
(65, 'Eva Assuah (Maame Aya)',          '',       5, 16, '','','','',''),
(66, 'Ibrahim Mohammed',                '',       5, 17, '','','','',''),
(71, 'Elvis Mensah',                    '',       5, 10, '','','','',''),
(72, 'Lucy Mensah (Maame Aya)',         '',       5, 10, '','','','',''),
(73, 'Emmanuel Mensah (Atta)',          '',       5, 10, '','','','',''),
(74, 'Elis Mensah (Effaw)',             '',       5, 10, '','','','',''),
(75, 'Georgina Ebela Mensah',           '',       5, 10, '','','','',''),
(78, 'Yaw',                             '',       5, 10, '','','','',''),
(86, 'Mother',                          '',       5, 81, '','','','',''),
(87, 'Aduah',                           '',       5, 81, '','','','',''),
(88, 'Thomas Cudjoe (Nana)',            '',       5, 83, '','','','',''),
(89, 'Pobi',                            '',       5, 83, '','','','',''),
(90, 'Mawusi',                          '',       5, 83, '','','','',''),
(91, 'Bright Andoh',                    '',       5, 84, '','','','',''),
(92, 'Getrude Andoh',                   '',       5, 84, '','','','',''),
(93, 'Samuella Andoh',                  '',       5, 84, '','','','',''),

-- ── Gen 6 ────────────────────────────────────────────────────────
(39, 'Eric Armah (Ndede)',              '',       6, 31, '','','','',''),
(40, 'Comfort Armah (Aya)',             '',       6, 31, '','','','',''),
(41, 'Emmanuel Armah (Nana Cudjoe)',    '',       6, 31, '','','','',''),
(42, 'Francis Armah (Kodoo)',           '',       6, 31, '','','','',''),
(43, 'Ebenezer Armah (Ek3la)',          '',       6, 31, '','','','',''),
(44, 'Francis Armah (Assuah)',          '',       6, 31, '','','','',''),
(45, 'Patrick Armah (Ajaybu)',          '',       6, 31, '','','','',''),
(46, 'Samuel Armah (Nyamek3)',          '',       6, 31, '','','','',''),
(47, 'Monica Armah (Nrenza)',           '',       6, 31, '','','','',''),
(48, 'Elie Basi Ackah',                 '',       6, 32, '','','','',''),
(49, 'Neri',                            '',       6, 32, '','','','',''),
(50, 'Elia',                            '',       6, 32, '','','','',''),
(51, 'Elize',                           '',       6, 32, '','','','',''),
(52, 'Monique Armah-Ackah (Nrenza)',    '',       6, 33, '','','','',''),
(53, 'Alfred Armah-Ackah',              '',       6, 33, '','','','',''),
(54, 'Nana Aya',                        '',       6, 33, '','','','',''),
(55, 'Nana Cudjoe Armah-Ackah',        '',       6, 33, '','','','',''),
(56, 'Nana Ek3la Armah-Ackah',         '',       6, 33, '','','','',''),
(58, 'Ayeyi Armah-Ackah',              '',       6, 33, '','','','',''),
(59, 'Ann Lyse Aya Coffie',             '',       6, 35, '','','','','');

ALTER TABLE members AUTO_INCREMENT = 100;

SELECT CONCAT('✅ Total seeded: ', COUNT(*), ' members') AS status FROM members;
SELECT gen, COUNT(*) AS count FROM members GROUP BY gen ORDER BY gen;
