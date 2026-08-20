<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = requireAuth($pdo);
$userId = (int)$user['id'];

$month = (int)($_GET['month'] ?? date('n'));
$year  = (int)($_GET['year']  ?? date('Y'));

if ($month < 1 || $month > 12) $month = (int)date('n');
if ($year < 2000 || $year > 2100) $year = (int)date('Y');

$start = sprintf('%04d-%02d-01 00:00:00', $year, $month);
$end   = date('Y-m-t 23:59:59', strtotime($start));
$prevStart = date('Y-m-01 00:00:00', strtotime("$start -1 month"));
$prevEnd   = date('Y-m-t 23:59:59', strtotime($prevStart));

try {
    $stmt = $pdo->prepare("
        SELECT reading_value, usage_m3, recorded_at
        FROM meter_readings
        WHERE user_id = ? AND recorded_at BETWEEN ? AND ?
        ORDER BY recorded_at ASC
    ");
    $stmt->execute([$userId, $start, $end]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT reading_value FROM meter_readings
        WHERE user_id = ? AND recorded_at < ?
        ORDER BY recorded_at DESC LIMIT 1
    ");
    $stmt->execute([$userId, $start]);
    $prev = $stmt->fetch(PDO::FETCH_ASSOC);
    $startValue = $prev ? (float)$prev['reading_value'] : 0.0;
    $endValue   = $rows ? (float)end($rows)['reading_value'] : $startValue;

    $stmt = $pdo->prepare("
        SELECT reading_value FROM meter_readings
        WHERE user_id = ? AND recorded_at < ?
        ORDER BY recorded_at DESC LIMIT 1
    ");
    $stmt->execute([$userId, $prevStart]);
    $prevPrev = $stmt->fetch(PDO::FETCH_ASSOC);
    $startPrev = $prevPrev ? (float)$prevPrev['reading_value'] : 0.0;
    $endPrev   = $prev ? (float)$prev['reading_value'] : $startPrev;

    $usageM3 = max(0.0, $endValue - $startValue);
    $prevUsageM3 = max(0.0, $endPrev - $startPrev);

    require_once __DIR__ . '/tariff.php';
    [$breakdown, $totalBill, $tariffSnapshot] = calculateBill($usageM3, $year);

    $stmt = $pdo->prepare("
        SELECT id, bill_number, period_month, period_year, usage_m3,
               total_bill, status, due_date, created_at
        FROM bills
        WHERE user_id = ? AND period_month = ? AND period_year = ?
        LIMIT 1
    ");
    $stmt->execute([$userId, $month, $year]);
    $bill = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bill && $usageM3 > 0) {
        $billNumber = 'BILL-' . $year . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($userId, 4, '0', STR_PAD_LEFT);
        $dueDate = date('Y-m-d', strtotime("$end +20 days"));
        $insert = $pdo->prepare("
            INSERT INTO bills (bill_number, user_id, period_month, period_year,
                               start_value, end_value, usage_m3, total_bill,
                               tariff_snapshot, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)
        ");
        $insert->execute([
            $billNumber, $userId, $month, $year,
            $startValue, $endValue, $usageM3, $totalBill,
            json_encode($tariffSnapshot), $dueDate
        ]);
        $bill = [
            'id' => (int)$pdo->lastInsertId(),
            'bill_number' => $billNumber,
            'period_month' => $month,
            'period_year' => $year,
            'usage_m3' => $usageM3,
            'total_bill' => $totalBill,
            'status' => 'unpaid',
            'due_date' => $dueDate,
        ];
    }

    echo json_encode([
        'success' => true,
        'period' => ['month' => $month, 'year' => $year],
        'usage_m3' => round($usageM3, 2),
        'previous_usage_m3' => round($prevUsageM3, 2),
        'start_value' => $startValue,
        'end_value' => $endValue,
        'breakdown' => $breakdown,
        'total_bill' => $totalBill,
        'tariff' => $tariffSnapshot,
        'bill' => $bill,
        'readings' => $rows,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal menghitung tagihan: ' . $e->getMessage()]);
}
?>
