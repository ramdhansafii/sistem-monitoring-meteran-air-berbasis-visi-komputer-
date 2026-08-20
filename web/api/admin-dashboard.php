<?php
/**
 * Admin Dashboard API
 * GET /api/admin-dashboard.php
 * Headers: Authorization: Bearer {token}  (role harus admin)
 *
 * Mengembalikan ringkasan seluruh sistem:
 * total pelanggan, total device, device aktif/offline,
 * total capture hari ini, estimasi pendapatan bulan ini,
 * grafik penggunaan seluruh pelanggan (7 hari), aktivitas terbaru.
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
    // Total pelanggan (role = user)
    $totalPelanggan = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();

    // Total device
    $totalDevice = (int)$pdo->query("SELECT COUNT(*) FROM devices")->fetchColumn();

    // Device aktif / offline
    $deviceAktif = (int)$pdo->query("SELECT COUNT(*) FROM devices WHERE is_active = TRUE")->fetchColumn();
    $deviceOffline = $totalDevice - $deviceAktif;

    // Total capture hari ini
    $totalCaptureHariIni = (int)$pdo->query("
        SELECT COUNT(*) FROM meter_readings WHERE DATE(reading_date) = CURDATE()
    ")->fetchColumn();

    // Total estimasi pendapatan bulan ini (sum bill_amount semua device bulan berjalan)
    $totalPendapatan = (float)$pdo->query("
        SELECT COALESCE(SUM(bill_amount), 0) FROM meter_readings
        WHERE YEAR(reading_date) = YEAR(CURDATE()) AND MONTH(reading_date) = MONTH(CURDATE())
    ")->fetchColumn();

    // Grafik penggunaan seluruh pelanggan, 7 hari terakhir (total m3 semua device per hari)
    $usageStmt = $pdo->query("
        SELECT DATE(reading_date) AS date, COALESCE(SUM(daily_usage), 0) AS usage_total
        FROM meter_readings
        WHERE reading_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(reading_date)
        ORDER BY date ASC
    ");
    $usageRows = $usageStmt->fetchAll(PDO::FETCH_ASSOC);
    $usageMap = [];
    foreach ($usageRows as $row) {
        $usageMap[$row['date']] = (float)$row['usage_total'];
    }
    $weeklyUsage = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-{$i} days"));
        $weeklyUsage[] = [
            'date' => $date,
            'usage' => $usageMap[$date] ?? 0,
        ];
    }

    // Aktivitas terbaru
    $activityStmt = $pdo->query("
        SELECT a.id, a.action, a.details, a.created_at, u.username, u.full_name
        FROM activity_log a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
        LIMIT 15
    ");
    $activities = $activityStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total_pelanggan' => $totalPelanggan,
        'total_device' => $totalDevice,
        'device_aktif' => $deviceAktif,
        'device_offline' => $deviceOffline,
        'total_capture_hari_ini' => $totalCaptureHariIni,
        'total_estimasi_pendapatan' => $totalPendapatan,
        'usage_chart' => $weeklyUsage,
        'recent_activity' => $activities,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal memuat dashboard admin: ' . $e->getMessage()]);
}
?>
