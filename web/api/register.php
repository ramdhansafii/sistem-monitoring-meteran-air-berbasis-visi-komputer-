<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
$fullName = trim($input['full_name'] ?? '');
$email = trim($input['email'] ?? '');
$deviceId = trim($input['device_id'] ?? '');

if (!$username || !$password || !$fullName) {
    http_response_code(400);
    echo json_encode(['error' => 'Username, password, dan nama lengkap wajib diisi']);
    exit;
}
if (strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'Username minimal 3 karakter']);
    exit;
}
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password minimal 6 karakter']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Username sudah digunakan']);
        exit;
    }

    $pdo->beginTransaction();

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("
        INSERT INTO users (username, password_hash, full_name, email, role, is_active)
        VALUES (?, ?, ?, ?, 'user', TRUE)
    ");
    $stmt->execute([$username, $hash, $fullName, $email ?: null]);
    $userId = (int)$pdo->lastInsertId();

    if ($deviceId) {
        $apiKey = bin2hex(random_bytes(24));
        $stmt = $pdo->prepare("
            INSERT INTO devices (device_id, owner_user_id, api_key, name, is_active)
            VALUES (?, ?, ?, ?, TRUE)
        ");
        $stmt->execute([$deviceId, $userId, $apiKey, 'ESP32-CAM ' . substr($deviceId, -4)]);
    }

    // Buat sesi login otomatis setelah registrasi berhasil (sama seperti login.php)
    $sessionToken = bin2hex(random_bytes(64));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_DURATION);
    $sessionStmt = $pdo->prepare("INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
    $sessionStmt->execute([
        $userId,
        $sessionToken,
        $_SERVER['REMOTE_ADDR'] ?? '',
        $_SERVER['HTTP_USER_AGENT'] ?? '',
        $expiresAt,
    ]);

    $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'register_success', ?, ?)");
    $logStmt->execute([$userId, "User baru mendaftar: $username", $_SERVER['REMOTE_ADDR'] ?? '']);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'token' => $sessionToken,
        'expires_at' => $expiresAt,
        'user' => [
            'id' => $userId,
            'username' => $username,
            'full_name' => $fullName,
            'email' => $email,
            'role' => 'user',
        ],
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Gagal registrasi: ' . $e->getMessage()]);
}
?>
