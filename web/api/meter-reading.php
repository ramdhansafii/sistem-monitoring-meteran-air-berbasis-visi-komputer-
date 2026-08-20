<?php
/**
 * Meter Reading API Endpoint (Updated)
 *
 * Receives meter readings from ESP32-CAM with TFLite OCR done on-device.
 * Stores reading + base64 image backup + calculates bill estimation.
 *
 * Usage from ESP32:
 *   POST http://localhost/sisfor_restoran/api/meter-reading.php
 *   Headers:
 *     X-Device-ID: 0016181234567890
 *     X-API-Key: esp32cam-001-aaaa-bbbb-cccc-dddd-eeee
 *   Body (JSON):
 *     {
 *       "reading": 342578,
 *       "confidence": 0.95,
 *       "digits": [3,4,2,5,7,8],
 *       "confidence_per_digit": [0.98,0.97,0.96,0.99,0.94,0.93],
 *       "battery": 3.85,
 *       "image_base64": "/9j/4AAQSkZ...",
 *       "timestamp": 1705312345
 *     }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header(
    'Access-Control-Allow-Headers: Content-Type, Authorization, X-Device-ID, X-API-Key'
);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_once 'middleware.php';
    $user = requireAuth($pdo);

    $usageStmt = $pdo->query("
        SELECT
            DATE(reading_date) AS date,
            MAX(reading) AS reading
        FROM meter_readings
        WHERE reading_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(reading_date)
        ORDER BY date ASC
    ");

    $rows = $usageStmt->fetchAll(PDO::FETCH_ASSOC);

    $usageMap = [];
    $prevReading = null;

    foreach ($rows as $row) {
        $current = (float)$row['reading'];

        if ($prevReading === null) {
            $usage = 0;
        } else {
            $usage = max(0, $current - $prevReading);
        }

        $usageMap[$row['date']] = $usage;
        $prevReading = $current;
    }

    $weeklyUsage = [];

    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-{$i} days"));

        $weeklyUsage[] = [
            'date' => $date,
            'water_usage' => $usageMap[$date] ?? 0
        ];
    }

    $firstTodayStmt = $pdo->query("
        SELECT reading
        FROM meter_readings
        WHERE DATE(reading_date)=CURDATE()
        ORDER BY reading_date ASC
        LIMIT 1
    ");

    $lastTodayStmt = $pdo->query("
        SELECT reading
        FROM meter_readings
        WHERE DATE(reading_date)=CURDATE()
        ORDER BY reading_date DESC
        LIMIT 1
    ");

   $firstToday = (float)$firstTodayStmt->fetchColumn();
$lastToday  = (float)$lastTodayStmt->fetchColumn();

    $dailyUsage = max(0, $lastToday - $firstToday);

    $firstMonthStmt = $pdo->query("
        SELECT reading
        FROM meter_readings
        WHERE YEAR(reading_date)=YEAR(CURDATE())
        AND MONTH(reading_date)=MONTH(CURDATE())
        ORDER BY reading_date ASC
        LIMIT 1
    ");

    $lastMonthStmt = $pdo->query("
        SELECT reading
        FROM meter_readings
        WHERE YEAR(reading_date)=YEAR(CURDATE())
        AND MONTH(reading_date)=MONTH(CURDATE())
        ORDER BY reading_date DESC
        LIMIT 1
    ");

    $monthlyUsage = max(
        0,
        (float)$lastMonthStmt->fetchColumn() -
        (float)$firstMonthStmt->fetchColumn()
    );

    $firstPrevMonthStmt = $pdo->query("
        SELECT reading
        FROM meter_readings
        WHERE YEAR(reading_date)=YEAR(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
        AND MONTH(reading_date)=MONTH(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
        ORDER BY reading_date ASC
        LIMIT 1
    ");

    $lastPrevMonthStmt = $pdo->query("
        SELECT reading
        FROM meter_readings
        WHERE YEAR(reading_date)=YEAR(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
        AND MONTH(reading_date)=MONTH(DATE_SUB(CURDATE(),INTERVAL 1 MONTH))
        ORDER BY reading_date DESC
        LIMIT 1
    ");

    $previousMonthUsage = max(
    0,
    (float)$lastPrevMonthStmt->fetchColumn() -
    (float)$firstPrevMonthStmt->fetchColumn()
);

    $month = isset($_GET['month']) ? (int)$_GET['month'] : null;
    $year  = isset($_GET['year']) ? (int)$_GET['year'] : null;

    if ($month && $year) {

        $stmt = $pdo->prepare("
            SELECT
                id,
                reading,
                confidence,
                reading_date,
                battery_voltage,
                image_path,
                daily_usage
            FROM meter_readings
            WHERE MONTH(reading_date)=?
            AND YEAR(reading_date)=?
            ORDER BY reading_date DESC
        ");

        $stmt->execute([$month, $year]);

    } else {

        $stmt = $pdo->prepare("
            SELECT
                id,
                reading,
                confidence,
                reading_date,
                battery_voltage,
                image_path,
                daily_usage
            FROM meter_readings
            ORDER BY reading_date DESC
            LIMIT 30
        ");

        $stmt->execute();

    }

    $readings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =====================================================
    // Response
    // =====================================================

    $pricePerM3 = getCurrentPrice($pdo);

    echo json_encode([
        'success' => true,
        'count' => count($readings),
        'current_reading' => $readings[0]['reading'] ?? 0,
        'daily_usage' => $dailyUsage,
        'monthly_usage' => $monthlyUsage,
        'previous_month_usage' => $previousMonthUsage,
        'latest_image' => $readings[0]['image_path'] ?? null,
        'bill_amount' => $monthlyUsage * $pricePerM3,
        'price_per_m3' => $pricePerM3,
        'usage' => $weeklyUsage,
        'readings' => $readings
    ]);

    exit;
}

// Get device credentials for POST
$deviceId = $_SERVER['HTTP_X_DEVICE_ID'] ?? '';
$apiKey   = $_SERVER['HTTP_X_API_KEY'] ?? '';

// Verify device
$deviceStmt = $pdo->prepare("SELECT id, name FROM devices WHERE device_id = ? AND api_key = ? AND is_active = TRUE LIMIT 1");
$deviceStmt->execute([$deviceId, $apiKey]);
$device = $deviceStmt->fetch();

if (!$device) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid device credentials']);
    exit;
}

$deviceId_db = $device['id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Parse multipart JSON
$input = [];

if (isset($_POST['data'])) {

    $input = json_decode($_POST['data'], true);

    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid JSON multipart data'
        ]);
        exit;
    }

} else {

    http_response_code(400);
    echo json_encode([
        'error' => 'Missing multipart data'
    ]);
    exit;
}

$imageReceived = false;

if (isset($_FILES['image'])) {

    if ($_FILES['image']['error'] === UPLOAD_ERR_OK) {

        $imageReceived = true;

        error_log(
            "JPEG received: " .
            $_FILES['image']['size'] .
            " bytes"
        );

    } else {

        error_log(
            "Image upload error: " .
            $_FILES['image']['error']
        );
    }
}

$reading           = isset($input['reading']) ? floatval($input['reading']) : 0.0;
$confidence        = isset($input['confidence']) ? floatval($input['confidence']) : 0.0;
$digits            = isset($input['digits']) ? $input['digits'] : [];
$confidenceDigits  = isset($input['confidence_per_digit']) ? $input['confidence_per_digit'] : [];
$battery           = isset($input['battery']) ? floatval($input['battery']) : null;
if (isset($input['timestamp'])) {
    $timestamp = strtotime($input['timestamp']);

    if ($timestamp === false) {
        $timestamp = time();
    }
} else {
    $timestamp = time();
}
$imageBase64 = null;

// support multipart jpg
$imagePath = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {

    $uploadDir = __DIR__ . '/uploads/meter_images/';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));

    // Kalau ESP ga ngirim extension
    if ($extension === '') {
        $extension = 'jpg';
    }

    $filename = sprintf(
        '%s_%d.%s',
        $deviceId,
        time(),
        $extension
    );

    $destination = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {

        $imageReceived = true;

        // path relatif untuk disimpan ke database
        $imagePath = 'uploads/meter_images/' . $filename;

        error_log("Image saved: " . $destination);

    } else {

        error_log("Failed moving uploaded image.");

    }
}

if ($reading <= 0 || $reading > 9999999) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid reading value (must be 1-9999999)']);
    exit;
}

if ($confidence < 0 || $confidence > 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid confidence value']);
    exit;
}

try {
    // Get previous reading to calculate daily usage
    $prevStmt = $pdo->prepare("
        SELECT reading, reading_date FROM meter_readings
        WHERE device_id = ? AND reading <= ?
        ORDER BY reading DESC
        LIMIT 1
    ");
    $prevStmt->execute([$deviceId_db, $reading]);
    $prev = $prevStmt->fetch();

    $dailyUsage = 0;
    if ($prev) {
        $dailyUsage = max(0, $reading - $prev['reading']);
    }

    // Get current price
    $pricePerM3 = getCurrentPrice($pdo);
    $billAmount = $dailyUsage * $pricePerM3;

    // Insert reading
    $insertStmt = $pdo->prepare("
    INSERT INTO meter_readings
    (
        device_id,
        reading,
        confidence,
        reading_date,
        daily_usage,
        bill_amount,
        battery_voltage,
        image_path,
        ocr_method
    )
    VALUES
    (
        ?, ?, ?, FROM_UNIXTIME(?),
        ?, ?, ?, ?, 'TFLITE'
    )
    ");

    $insertStmt->execute([
        $deviceId_db,
        $reading,
        $confidence,
        $timestamp,
        $dailyUsage,
        $billAmount,
        $battery,
        $imagePath
    ]);

    $readingId = $pdo->lastInsertId();

    // Update device battery
    if ($battery !== null) {
        $updateDevice = $pdo->prepare("UPDATE devices SET battery_voltage = ?, last_seen = NOW() WHERE id = ?");
        $updateDevice->execute([$battery, $deviceId_db]);
    } else {
        $updateDevice = $pdo->prepare("UPDATE devices SET last_seen = NOW() WHERE id = ?");
        $updateDevice->execute([$deviceId_db]);
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'reading_id' => $readingId,
        'reading' => $reading,
        'digits' => $digits,
        'confidence' => round($confidence, 4),
        'daily_usage' => $dailyUsage,
        'price_per_m3' => $pricePerM3,
        'bill_amount' => $billAmount,
        'timestamp' => date('Y-m-d H:i:s', $timestamp),
        'image_received' => $imageReceived,
        'image_path' => $imagePath,
    ]);

} catch (PDOException $e) {
    error_log($e->getMessage());

    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>