<?php
/**
 * Correct Reading API
 * Allows admin/user to correct a meter reading when OCR is wrong
 *
 * POST /api/correct-reading.php
 * Headers: Authorization: Bearer {token}
 * Body: { "reading_id": 123, "corrected_reading": 342579, "notes": "OCR misread digit 6" }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
require_once 'middleware.php';

$user = requireAuth($pdo);

$input = json_decode(file_get_contents('php://input'), true);

$readingId = isset($input['reading_id']) ? intval($input['reading_id']) : 0;
$corrected = isset($input['corrected_reading']) ? intval($input['corrected_reading']) : 0;
$notes     = isset($input['notes']) ? trim($input['notes']) : '';

if ($readingId <= 0 || $corrected <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid reading_id or corrected_reading']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Get original reading
    $stmt = $pdo->prepare("SELECT id, device_id, reading, daily_usage, bill_amount, image_base64 FROM meter_readings WHERE id = ? FOR UPDATE");
    $stmt->execute([$readingId]);
    $original = $stmt->fetch();

    if (!$original) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Reading not found']);
        exit;
    }

    // Calculate new daily usage
    $prevStmt = $pdo->prepare("
        SELECT reading FROM meter_readings
        WHERE device_id = ? AND reading <= ? AND id != ?
        ORDER BY reading DESC
        LIMIT 1
    ");
    $prevStmt->execute([$original['device_id'], $corrected, $readingId]);
    $prev = $prevStmt->fetch();
    $newDailyUsage = $prev ? max(0, $corrected - $prev['reading']) : 0;
    $pricePerM3 = getCurrentPrice($pdo);
    $newBill = $newDailyUsage * $pricePerM3;

    // Update reading
    $updateStmt = $pdo->prepare("
        UPDATE meter_readings
        SET reading = ?,
            original_reading = ?,
            daily_usage = ?,
            bill_amount = ?,
            manual_corrected = TRUE,
            notes = ?,
            confidence = 1.0
        WHERE id = ?
    ");
    $updateStmt->execute([
        $corrected,
        $original['reading'],
        $newDailyUsage,
        $newBill,
        $notes ?: "Manual correction by " . $user['username'],
        $readingId
    ]);

    // Recalculate all subsequent readings' daily_usage
    $subsequentStmt = $pdo->prepare("
        SELECT id, reading FROM meter_readings
        WHERE device_id = ? AND id > ? ORDER BY id ASC
    ");
    $subsequentStmt->execute([$original['device_id'], $readingId]);
    $subsequent = $subsequentStmt->fetchAll();

    $prevReading = $corrected;
    foreach ($subsequent as $row) {
        $usage = max(0, $row['reading'] - $prevReading);
        $bill = $usage * $pricePerM3;
        $upd = $pdo->prepare("UPDATE meter_readings SET daily_usage = ?, bill_amount = ? WHERE id = ?");
        $upd->execute([$usage, $bill, $row['id']]);
        $prevReading = $row['reading'];
    }

    // Log activity
    $logStmt = $pdo->prepare("INSERT INTO activity_log (user_id, action, details, ip_address) VALUES (?, 'correct_reading', ?, ?)");
    $logStmt->execute([
        $user['id'],
        "Corrected reading #$readingId from {$original['reading']} to $corrected",
        $_SERVER['REMOTE_ADDR'] ?? ''
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'reading_id' => $readingId,
        'original_reading' => $original['reading'],
        'corrected_reading' => $corrected,
        'new_daily_usage' => $newDailyUsage,
        'new_bill_amount' => $newBill
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
