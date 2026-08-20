<?php
/**
 * Login API Endpoint
 * POST /api/login.php
 * Body: { "username": "admin", "password": "admin123" }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Username dan password harus diisi']);
    exit;
}

$username = trim($input['username']);
$password = $input['password'];

try {
    $stmt = $pdo->prepare("SELECT id, username, password_hash, full_name, email, role, is_active FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Username atau password salah']);
        exit;
    }

    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode(['error' => 'Akun tidak aktif']);
        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        // Log failed attempt
        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'login_failed', ?, ?)");
        $logStmt->execute([$user['id'], "Failed login for: $username", $_SERVER['REMOTE_ADDR'] ?? '']);

        http_response_code(401);
        echo json_encode(['error' => 'Username atau password salah']);
        exit;
    }

    // Generate session token
    $sessionToken = bin2hex(random_bytes(64));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_DURATION);

    $sessionStmt = $pdo->prepare("INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
    $sessionStmt->execute([
        $user['id'],
        $sessionToken,
        $_SERVER['REMOTE_ADDR'] ?? '',
        $_SERVER['HTTP_USER_AGENT'] ?? '',
        $expiresAt
    ]);

    // Update last_login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);

    // Log success
    $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'login_success', ?, ?)");
    $logStmt->execute([$user['id'], "User logged in", $_SERVER['REMOTE_ADDR'] ?? '']);

    // Return success
    echo json_encode([
        'success' => true,
        'token' => $sessionToken,
        'expires_at' => $expiresAt,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
