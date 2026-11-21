-- Medical institutes shown on the public "Find help" map.
-- Managed by super admins from /panel/institutes; bulk data can be imported
-- from OpenStreetMap (rows with source = 'osm' and a unique osm_ref).

CREATE TABLE IF NOT EXISTS medical_institutes (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  country_code CHAR(2) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'clinic',
  address VARCHAR(500) NULL,
  city VARCHAR(160) NULL,
  phone VARCHAR(120) NULL,
  website VARCHAR(500) NULL,
  hours VARCHAR(255) NULL,
  emergency TINYINT(1) NOT NULL DEFAULT 0,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(16) NOT NULL DEFAULT 'manual',
  osm_ref VARCHAR(40) NULL,
  manually_edited TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY medical_institutes_osm_ref_uq (osm_ref),
  INDEX medical_institutes_geo_idx (is_active, lat, lng),
  INDEX medical_institutes_country_idx (country_code, is_active, category),
  INDEX medical_institutes_name_idx (name)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Initial curated entries (previously hard-coded in the app).
INSERT INTO medical_institutes (country_code, name, category, address, city, phone, hours, emergency, lat, lng, source, osm_ref)
SELECT * FROM (
  SELECT 'RO' AS country_code, 'Spitalul Universitar de Urgență București' AS name, 'hospital' AS category, 'Splaiul Independenței 169' AS address, 'București' AS city, '021 318 05 23' AS phone, '24/7' AS hours, 1 AS emergency, 44.434700 AS lat, 26.052400 AS lng, 'manual' AS source, 'seed/ro-1' AS osm_ref
  UNION ALL SELECT 'RO', 'Spitalul Clinic de Urgență București', 'hospital', 'Calea Floreasca 8', 'București', '021 599 23 00', '24/7', 1, 44.461700, 26.099200, 'manual', 'seed/ro-2'
  UNION ALL SELECT 'RO', 'Spitalul Clinic Colentina', 'hospital', 'Șoseaua Ștefan cel Mare 19-21', 'București', '021 317 32 45', '24/7', 0, 44.450000, 26.101400, 'manual', 'seed/ro-3'
  UNION ALL SELECT 'RO', 'MedLife Victoriei', 'clinic', 'Calea Victoriei 222', 'București', '021 9646', 'Mo-Fr 07:00-21:00', 0, 44.452400, 26.088000, 'manual', 'seed/ro-4'
  UNION ALL SELECT 'RO', 'Farmacia Tei Barbu Văcărescu', 'pharmacy', 'Strada Barbu Văcărescu 154-158', 'București', '021 796 69 99', 'Mo-Su 08:00-22:00', 0, 44.475000, 26.104300, 'manual', 'seed/ro-5'
  UNION ALL SELECT 'RO', 'Spitalul Clinic de Chirurgie Oro-Maxilo-Facială', 'dentist', 'Calea Plevnei 17-21', 'București', '021 315 55 56', '24/7', 0, 44.432300, 26.083100, 'manual', 'seed/ro-6'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM medical_institutes LIMIT 1);
