<?php
/**
 * Admin Device Map API
 * GET /api/admin-map.php
 * Headers: Authorization: Bearer {token} (role harus admin)
 *
 * Mengembalikan seluruh device beserta koordinat, status,
 * pembacaan terakhir, dan waktu update terakhir untuk ditampilkan di peta.
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
    $stmt = $pdo->query("
        SELECT
            d.id, d.device_id, d.name, d.serial_number, d.location,
            d.latitude, d.longitude, d.is_active, d.last_seen,
            u.full_name AS owner_name, u.username AS owner_username,
            (SELECT mr.reading FROM meter_readings mr WHERE mr.device_id = d.id ORDER BY mr.reading_date DESC LIMIT 1) AS last_reading,
            (SELECT mr.reading_date FROM meter_readings mr WHERE mr.device_id = d.id ORDER BY mr.reading_date DESC LIMIT 1) AS last_reading_at
        FROM devices d
        LEFT JOIN users u ON u.id = d.owner_user_id
        WHERE d.latitude IS NOT NULL AND d.longitude IS NOT NULL
        ORDER BY d.id ASC
    ");
    $rows = $stmt->fetchAll();

    $devices = array_map(function ($d) {
        return [
            'id' => (int)$d['id'],
            'device_id' => $d['device_id'],
            'name' => $d['name'],
            'serial_number' => $d['serial_number'],
            'location' => $d['location'],
            'latitude' => (float)$d['latitude'],
            'longitude' => (float)$d['longitude'],
            'is_active' => (bool)$d['is_active'],
            'owner_name' => $d['owner_name'] ?: 'Belum ada pemilik',
            'owner_username' => $d['owner_username'],
            'last_reading' => $d['last_reading'] !== null ? (int)$d['last_reading'] : null,
            'last_reading_at' => $d['last_reading_at'],
            'last_seen' => $d['last_seen'],
        ];
    }, $rows);

    echo json_encode([
        'success' => true,
        'count' => count($devices),
        'devices' => $devices,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal memuat data peta: ' . $e->getMessage()]);
}
?>
