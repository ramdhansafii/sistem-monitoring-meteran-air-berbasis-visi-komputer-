<?php
/**
 * Admin Device Management API
 * GET    /api/admin-devices.php?search=       -> list & cari device
 * GET    /api/admin-devices.php?id=5          -> detail 1 device
 * POST   /api/admin-devices.php               -> tambah device
 * PUT    /api/admin-devices.php?id=5          -> edit device
 * DELETE /api/admin-devices.php?id=5          -> hapus device
 * Headers: Authorization: Bearer {token} (role harus admin)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$admin = requireAdmin($pdo);
$method = $_SERVER['REQUEST_METHOD'];

function devicePublic($d) {
    return [
        'id' => (int)$d['id'],
        'device_id' => $d['device_id'],
        'name' => $d['name'],
        'serial_number' => $d['serial_number'],
        'location' => $d['location'],
        'latitude' => $d['latitude'] !== null ? (float)$d['latitude'] : null,
        'longitude' => $d['longitude'] !== null ? (float)$d['longitude'] : null,
        'owner_user_id' => $d['owner_user_id'] !== null ? (int)$d['owner_user_id'] : null,
        'owner_name' => $d['owner_name'] ?? null,
        'is_active' => (bool)$d['is_active'],
        'last_seen' => $d['last_seen'],
        'battery_voltage' => $d['battery_voltage'] !== null ? (float)$d['battery_voltage'] : null,
        'created_at' => $d['created_at'],
    ];
}

const DEVICE_SELECT = "
    SELECT d.*, u.full_name AS owner_name
    FROM devices d
    LEFT JOIN users u ON u.id = d.owner_user_id
";

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare(DEVICE_SELECT . " WHERE d.id = ? LIMIT 1");
            $stmt->execute([(int)$_GET['id']]);
            $d = $stmt->fetch();
            if (!$d) { http_response_code(404); echo json_encode(['error' => 'Device tidak ditemukan']); exit; }
            echo json_encode(['success' => true, 'device' => devicePublic($d)]);
            exit;
        }

        $search = trim($_GET['search'] ?? '');
        $params = [];
        $where = '';
        if ($search !== '') {
            $where = "WHERE d.name LIKE ? OR d.device_id LIKE ? OR d.serial_number LIKE ? OR d.location LIKE ? OR u.full_name LIKE ?";
            $like = "%$search%";
            $params = [$like, $like, $like, $like, $like];
        }

        $stmt = $pdo->prepare(DEVICE_SELECT . " $where ORDER BY d.created_at DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($rows),
            'devices' => array_map('devicePublic', $rows),
        ]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $deviceId = trim($input['device_id'] ?? '');
        $name = trim($input['name'] ?? '');
        $serialNumber = trim($input['serial_number'] ?? '');
        $location = trim($input['location'] ?? '');
        $latitude = isset($input['latitude']) && $input['latitude'] !== '' ? (float)$input['latitude'] : null;
        $longitude = isset($input['longitude']) && $input['longitude'] !== '' ? (float)$input['longitude'] : null;
        $ownerUserId = !empty($input['owner_user_id']) ? (int)$input['owner_user_id'] : null;
        $isActive = array_key_exists('is_active', $input) ? (bool)$input['is_active'] : true;

        if (!$deviceId || !$name) {
            http_response_code(400);
            echo json_encode(['error' => 'ID Device dan Nama Device wajib diisi']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id FROM devices WHERE device_id = ? LIMIT 1");
        $stmt->execute([$deviceId]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'ID Device sudah digunakan']);
            exit;
        }

        // Dummy koordinat area Jakarta jika tidak diisi
        if ($latitude === null || $longitude === null) {
            $latitude = -6.200000 + ((mt_rand(-1000, 1000) / 1000) * 0.1);
            $longitude = 106.816666 + ((mt_rand(-1000, 1000) / 1000) * 0.1);
        }

        $apiKey = bin2hex(random_bytes(24));

        $stmt = $pdo->prepare("
            INSERT INTO devices (device_id, name, serial_number, location, latitude, longitude, owner_user_id, api_key, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$deviceId, $name, $serialNumber ?: null, $location ?: null, $latitude, $longitude, $ownerUserId, $apiKey, $isActive]);
        $newId = (int)$pdo->lastInsertId();

        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'admin_create_device', ?, ?)");
        $logStmt->execute([$admin['id'], "Admin {$admin['username']} menambahkan device $deviceId", $_SERVER['REMOTE_ADDR'] ?? '']);

        $stmt = $pdo->prepare(DEVICE_SELECT . " WHERE d.id = ?");
        $stmt->execute([$newId]);
        echo json_encode(['success' => true, 'device' => devicePublic($stmt->fetch())]);
        exit;
    }

    if ($method === 'PUT') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID device wajib diisi']); exit; }

        $stmt = $pdo->prepare("SELECT * FROM devices WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) { http_response_code(404); echo json_encode(['error' => 'Device tidak ditemukan']); exit; }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $deviceId = isset($input['device_id']) ? trim($input['device_id']) : $existing['device_id'];
        $name = isset($input['name']) ? trim($input['name']) : $existing['name'];
        $serialNumber = array_key_exists('serial_number', $input) ? trim($input['serial_number']) : $existing['serial_number'];
        $location = array_key_exists('location', $input) ? trim($input['location']) : $existing['location'];
        $latitude = array_key_exists('latitude', $input) && $input['latitude'] !== '' ? (float)$input['latitude'] : $existing['latitude'];
        $longitude = array_key_exists('longitude', $input) && $input['longitude'] !== '' ? (float)$input['longitude'] : $existing['longitude'];
        $ownerUserId = array_key_exists('owner_user_id', $input) ? (!empty($input['owner_user_id']) ? (int)$input['owner_user_id'] : null) : $existing['owner_user_id'];
        $isActive = array_key_exists('is_active', $input) ? (bool)$input['is_active'] : (bool)$existing['is_active'];

        if (!$deviceId || !$name) {
            http_response_code(400);
            echo json_encode(['error' => 'ID Device dan Nama Device wajib diisi']);
            exit;
        }

        if ($deviceId !== $existing['device_id']) {
            $chk = $pdo->prepare("SELECT id FROM devices WHERE device_id = ? AND id != ? LIMIT 1");
            $chk->execute([$deviceId, $id]);
            if ($chk->fetch()) {
                http_response_code(409); echo json_encode(['error' => 'ID Device sudah digunakan']); exit;
            }
        }

        $stmt = $pdo->prepare("
            UPDATE devices SET device_id=?, name=?, serial_number=?, location=?, latitude=?, longitude=?, owner_user_id=?, is_active=?
            WHERE id=?
        ");
        $stmt->execute([$deviceId, $name, $serialNumber ?: null, $location ?: null, $latitude, $longitude, $ownerUserId, $isActive, $id]);

        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'admin_update_device', ?, ?)");
        $logStmt->execute([$admin['id'], "Admin {$admin['username']} mengubah device #$id", $_SERVER['REMOTE_ADDR'] ?? '']);

        $stmt = $pdo->prepare(DEVICE_SELECT . " WHERE d.id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'device' => devicePublic($stmt->fetch())]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID device wajib diisi']); exit; }

        $stmt = $pdo->prepare("SELECT device_id FROM devices WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) { http_response_code(404); echo json_encode(['error' => 'Device tidak ditemukan']); exit; }

        $del = $pdo->prepare("DELETE FROM devices WHERE id = ?");
        $del->execute([$id]);

        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'admin_delete_device', ?, ?)");
        $logStmt->execute([$admin['id'], "Admin {$admin['username']} menghapus device {$target['device_id']}", $_SERVER['REMOTE_ADDR'] ?? '']);

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
