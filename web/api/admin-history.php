<?php
/**
 * Admin History API
 * GET /api/admin-history.php?search=&date_from=&date_to=&page=&limit=
 * Headers: Authorization: Bearer {token} (role harus admin)
 *
 * Mengembalikan riwayat pembacaan seluruh pelanggan:
 * nama pelanggan, ID device, hasil OCR, nilai meter, foto, tanggal, waktu.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

requireAdmin($pdo);

try {
    $search = trim($_GET['search'] ?? '');
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo = trim($_GET['date_to'] ?? '');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];

    if ($search !== '') {
        $where[] = "(u.full_name LIKE ? OR u.username LIKE ? OR d.device_id LIKE ? OR d.name LIKE ?)";
        $like = "%$search%";
        array_push($params, $like, $like, $like, $like);
    }
    if ($dateFrom !== '') {
        $where[] = "mr.reading_date >= ?";
        $params[] = $dateFrom . ' 00:00:00';
    }
    if ($dateTo !== '') {
        $where[] = "mr.reading_date <= ?";
        $params[] = $dateTo . ' 23:59:59';
    }

    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM meter_readings mr
        JOIN devices d ON d.id = mr.device_id
        LEFT JOIN users u ON u.id = d.owner_user_id
        $whereSql
    ");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT
            mr.id, mr.reading, mr.confidence, mr.reading_date, mr.daily_usage,
            mr.bill_amount, mr.image_path, mr.ocr_method, mr.manual_corrected,
            d.device_id, d.name AS device_name,
            u.id AS user_id, u.full_name AS customer_name, u.username AS customer_username
        FROM meter_readings mr
        JOIN devices d ON d.id = mr.device_id
        LEFT JOIN users u ON u.id = d.owner_user_id
        $whereSql
        ORDER BY mr.reading_date DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $history = array_map(function ($r) {
        return [
            'id' => (int)$r['id'],
            'customer_name' => $r['customer_name'] ?: 'Belum ada pemilik',
            'customer_username' => $r['customer_username'],
            'device_id' => $r['device_id'],
            'device_name' => $r['device_name'],
            'reading' => (int)$r['reading'],
            'confidence' => (float)$r['confidence'],
            'ocr_method' => $r['ocr_method'],
            'manual_corrected' => (bool)$r['manual_corrected'],
            'daily_usage' => (float)$r['daily_usage'],
            'bill_amount' => (float)$r['bill_amount'],
            'image_path' => $r['image_path'],
            'reading_date' => $r['reading_date'],
        ];
    }, $rows);

    echo json_encode([
        'success' => true,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => (int)ceil($total / $limit),
        'history' => $history,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal memuat riwayat: ' . $e->getMessage()]);
}
?>
