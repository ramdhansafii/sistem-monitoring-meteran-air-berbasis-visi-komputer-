<?php
/**
 * Admin User Management API
 * GET    /api/admin-users.php?search=&page=&limit=   -> list & cari pengguna
 * GET    /api/admin-users.php?id=5                    -> detail 1 pengguna
 * POST   /api/admin-users.php                         -> tambah pengguna
 * PUT    /api/admin-users.php?id=5                    -> edit pengguna
 * DELETE /api/admin-users.php?id=5                    -> hapus pengguna
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

function userPublic($u) {
    return [
        'id' => (int)$u['id'],
        'username' => $u['username'],
        'full_name' => $u['full_name'],
        'email' => $u['email'],
        'phone' => $u['phone'],
        'address' => $u['address'],
        'role' => $u['role'],
        'is_active' => (bool)$u['is_active'],
        'created_at' => $u['created_at'],
        'last_login' => $u['last_login'],
    ];
}

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([(int)$_GET['id']]);
            $u = $stmt->fetch();
            if (!$u) { http_response_code(404); echo json_encode(['error' => 'Pengguna tidak ditemukan']); exit; }
            echo json_encode(['success' => true, 'user' => userPublic($u)]);
            exit;
        }

        $search = trim($_GET['search'] ?? '');
        $params = [];
        $where = '';
        if ($search !== '') {
            $where = "WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ? OR phone LIKE ?";
            $like = "%$search%";
            $params = [$like, $like, $like, $like];
        }

        $stmt = $pdo->prepare("SELECT * FROM users $where ORDER BY created_at DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($rows),
            'users' => array_map('userPublic', $rows),
        ]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $fullName = trim($input['full_name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $address = trim($input['address'] ?? '');
        $role = in_array($input['role'] ?? 'user', ['admin', 'user']) ? $input['role'] : 'user';
        $isActive = array_key_exists('is_active', $input) ? (bool)$input['is_active'] : true;

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

        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Username sudah digunakan']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            INSERT INTO users (username, password_hash, full_name, email, phone, address, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$username, $hash, $fullName, $email ?: null, $phone ?: null, $address ?: null, $role, $isActive]);
        $newId = (int)$pdo->lastInsertId();

        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'admin_create_user', ?, ?)");
        $logStmt->execute([$admin['id'], "Admin {$admin['username']} menambahkan pengguna $username", $_SERVER['REMOTE_ADDR'] ?? '']);

        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$newId]);
        echo json_encode(['success' => true, 'user' => userPublic($stmt->fetch())]);
        exit;
    }

    if ($method === 'PUT') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID pengguna wajib diisi']); exit; }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) { http_response_code(404); echo json_encode(['error' => 'Pengguna tidak ditemukan']); exit; }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $fullName = trim($input['full_name'] ?? $existing['full_name']);
        $email = array_key_exists('email', $input) ? trim($input['email']) : $existing['email'];
        $phone = array_key_exists('phone', $input) ? trim($input['phone']) : $existing['phone'];
        $address = array_key_exists('address', $input) ? trim($input['address']) : $existing['address'];
        $role = isset($input['role']) && in_array($input['role'], ['admin', 'user']) ? $input['role'] : $existing['role'];
        $isActive = array_key_exists('is_active', $input) ? (bool)$input['is_active'] : (bool)$existing['is_active'];

        if (!$fullName) {
            http_response_code(400);
            echo json_encode(['error' => 'Nama lengkap wajib diisi']);
            exit;
        }

        // Username boleh diubah, cek duplikasi jika berubah
        $username = isset($input['username']) ? trim($input['username']) : $existing['username'];
        if ($username !== $existing['username']) {
            if (strlen($username) < 3) {
                http_response_code(400); echo json_encode(['error' => 'Username minimal 3 karakter']); exit;
            }
            $chk = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1");
            $chk->execute([$username, $id]);
            if ($chk->fetch()) {
                http_response_code(409); echo json_encode(['error' => 'Username sudah digunakan']); exit;
            }
        }

        if (!empty($input['password'])) {
            if (strlen($input['password']) < 6) {
                http_response_code(400); echo json_encode(['error' => 'Password minimal 6 karakter']); exit;
            }
            $hash = password_hash($input['password'], PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("
                UPDATE users SET username=?, full_name=?, email=?, phone=?, address=?, role=?, is_active=?, password_hash=?
                WHERE id=?
            ");
            $stmt->execute([$username, $fullName, $email ?: null, $phone ?: null, $address ?: null, $role, $isActive, $hash, $id]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE users SET username=?, full_name=?, email=?, phone=?, address=?, role=?, is_active=?
                WHERE id=?
            ");
            $stmt->execute([$username, $fullName, $email ?: null, $phone ?: null, $address ?: null, $role, $isActive, $id]);
        }

        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'admin_update_user', ?, ?)");
        $logStmt->execute([$admin['id'], "Admin {$admin['username']} mengubah data pengguna #$id", $_SERVER['REMOTE_ADDR'] ?? '']);

        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'user' => userPublic($stmt->fetch())]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID pengguna wajib diisi']); exit; }

        if ($id === (int)$admin['id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Tidak dapat menghapus akun sendiri']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $target = $stmt->fetch();
        if (!$target) { http_response_code(404); echo json_encode(['error' => 'Pengguna tidak ditemukan']); exit; }

        $del = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $del->execute([$id]);

        $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'admin_delete_user', ?, ?)");
        $logStmt->execute([$admin['id'], "Admin {$admin['username']} menghapus pengguna {$target['username']}", $_SERVER['REMOTE_ADDR'] ?? '']);

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
