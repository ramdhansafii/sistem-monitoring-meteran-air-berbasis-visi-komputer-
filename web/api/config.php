<?php
/**
 * Database Configuration
 * Dipakai oleh semua PHP scripts
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'meteran_db');

// Price per cubic meter
define('PRICE_PER_M3', 3000);

// Session settings
define('SESSION_DURATION', 86400); // 24 hours

// Temp directory
define('TEMP_DIR', __DIR__ . '/../tmp/');
if (!is_dir(TEMP_DIR)) {
    @mkdir(TEMP_DIR, 0755, true);
}

// Connect to database
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get current price from DB
function getCurrentPrice($pdo) {
    $stmt = $pdo->prepare("SELECT price_per_m3 FROM bill_pricing WHERE is_active = TRUE ORDER BY effective_from DESC LIMIT 1");
    $stmt->execute();
    $result = $stmt->fetch();
    return $result ? (float)$result['price_per_m3'] : PRICE_PER_M3;
}
?>
