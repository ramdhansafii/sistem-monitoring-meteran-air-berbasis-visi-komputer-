<?php
/**
 * Setup script untuk create admin user dan sample user
 * Jalankan sekali untuk initialize: php setup-admin.php
 * atau buka di browser: http://localhost/sisfor_restoran/api/setup-admin.php
 */

require_once 'config.php';

$passwords = [
    'admin' => password_hash('admin123', PASSWORD_DEFAULT),
    'user'  => password_hash('user123', PASSWORD_DEFAULT),
];

try {
    // Insert admin
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE role=VALUES(role), password_hash=VALUES(password_hash)");
    $stmt->execute(['admin', $passwords['admin'], 'Administrator', 'admin@meteran.local', 'admin']);
    echo "✓ Admin user updated/created (username: admin, password: admin123)\n";

    // Insert demo user
    $stmt->execute(['user', $passwords['user'], 'Demo User', 'user@meteran.local', 'user']);
    echo "✓ Demo user updated/created (username: user, password: user123)\n";

    // Insert penjual pulsa
    $stmt->execute(['penjual', $passwords['user'], 'Penjual Pulsa', 'penjual@meteran.local', 'penjual_pulsa']);
    echo "✓ Penjual Pulsa updated/created (username: penjual, password: user123)\n";

    echo "\nSetup complete! You can now login.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
