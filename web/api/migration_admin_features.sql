-- ============================================
-- Migration: Fitur Admin (Role, CRUD, Peta, Riwayat)
-- Jalankan file ini jika database `meteran_db` SUDAH pernah
-- di-install sebelumnya (tidak perlu install_db.sql ulang).
--
-- Cara pakai:
--   mysql -u root -p meteran_db < migration_admin_features.sql
-- ============================================

USE meteran_db;

-- Tambah kolom kontak & alamat ke users (aman dijalankan berkali-kali di MySQL 8+)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email,
    ADD COLUMN IF NOT EXISTS address VARCHAR(255) AFTER phone;

-- Tambah kolom serial number, koordinat peta, dan pemilik ke devices
ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS serial_number VARCHAR(64) AFTER name,
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7) AFTER location,
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7) AFTER latitude,
    ADD COLUMN IF NOT EXISTS owner_user_id INT NULL AFTER longitude;

-- Tambah kolom image_path ke meter_readings (dipakai oleh meter-reading.php,
-- sebelumnya hanya ada image_base64 di skema lama)
ALTER TABLE meter_readings
    ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) AFTER battery_voltage;

-- Tambah foreign key pemilik device -> users (skip jika sudah ada)
SET @fk_exists := (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'devices'
    AND CONSTRAINT_NAME = 'fk_devices_owner'
);
SET @sql := IF(@fk_exists = 0,
    'ALTER TABLE devices ADD CONSTRAINT fk_devices_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "fk_devices_owner already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Isi serial_number default dari device_id kalau masih kosong
UPDATE devices SET serial_number = CONCAT('SN-', device_id) WHERE serial_number IS NULL OR serial_number = '';

-- Isi koordinat dummy (area Jakarta) untuk device yang belum punya lokasi
UPDATE devices
SET latitude = -6.200000 + (RAND() - 0.5) * 0.2,
    longitude = 106.816666 + (RAND() - 0.5) * 0.2
WHERE latitude IS NULL OR longitude IS NULL;

-- Jika belum ada akun admin, jalankan api/setup-admin.php (via browser atau `php setup-admin.php`)
-- untuk membuat akun admin default (username: admin, password: admin123).
