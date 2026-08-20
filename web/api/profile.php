<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = requireAuth($pdo);
$userId = (int)$user['id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT id, username, full_name, email, role, created_at
        FROM users WHERE id = ? LIMIT 1
    ");
    $stmt->execute([$userId]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS total_readings,
               COALESCE(SUM(usage_m3), 0) AS total_usage
        FROM meter_readings WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT id, device_id, name, last_seen, is_active, created_at
        FROM devices WHERE owner_user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'user' => $u,
        'stats' => $stats,
        'devices' => $devices,
    ]);
    exit;
}

if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $fullName = trim($input['full_name'] ?? '');
    $email = trim($input['email'] ?? '');
    $newPassword = $input['password'] ?? '';

    if (!$fullName) {
        http_response_code(400);
        echo json_encode(['error' => 'Nama lengkap wajib diisi']);
        exit;
    }

    if ($newPassword) {
        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password minimal 6 karakter']);
            exit;
        }
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, password_hash = ? WHERE id = ?");
        $stmt->execute([$fullName, $email ?: null, $hash, $userId]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET full_name = ?, email = ? WHERE id = ?");
        $stmt->execute([$fullName, $email ?: null, $userId]);
    }

    echo json_encode(['success' => true, 'message' => 'Profile berhasil diperbarui']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
