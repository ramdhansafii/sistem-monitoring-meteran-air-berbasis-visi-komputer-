<?php
/**
 * Readings API - Get readings with auth
 * GET /api/readings.php?days=30
 *
 * Returns list of readings with bill information
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
require_once 'middleware.php';

$user = requireAuth($pdo);

$days = isset($_GET['days']) ? intval($_GET['days']) : 30;
$days = max(1, min(365, $days));
$deviceId = isset($_GET['device_id']) ? intval($_GET['device_id']) : null;

try {
    if ($deviceId) {
        $stmt = $pdo->prepare("
            SELECT r.id, r.reading, r.confidence, r.reading_date, r.daily_usage, r.bill_amount,
                   r.battery_voltage, r.manual_corrected, r.original_reading, r.notes,
                   d.name as device_name, d.location
            FROM meter_readings r
            JOIN devices d ON d.id = r.device_id
            WHERE r.device_id = ? AND r.reading_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY r.reading_date DESC
        ");
        $stmt->execute([$deviceId, $days]);
    } else {
        $stmt = $pdo->prepare("
            SELECT r.id, r.reading, r.confidence, r.reading_date, r.daily_usage, r.bill_amount,
                   r.battery_voltage, r.manual_corrected, r.original_reading, r.notes,
                   d.name as device_name, d.location
            FROM meter_readings r
            JOIN devices d ON d.id = r.device_id
            WHERE r.reading_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY r.reading_date DESC
        ");
        $stmt->execute([$days]);
    }

    $readings = $stmt->fetchAll();

    $pricePerM3 = getCurrentPrice($pdo);

    // Summary
    $totalUsage = array_sum(array_column($readings, 'daily_usage'));
    $totalBill = $totalUsage * $pricePerM3;

    echo json_encode([
        'success' => true,
        'price_per_m3' => $pricePerM3,
        'summary' => [
            'count' => count($readings),
            'total_usage_m3' => round($totalUsage, 2),
            'total_bill_idr' => round($totalBill, 0)
        ],
        'readings' => $readings
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
