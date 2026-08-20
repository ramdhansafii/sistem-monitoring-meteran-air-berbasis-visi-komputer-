<?php
/**
 * MQTT Message Consumer
 *
 * Listens to MQTT topic 'meteran/reading' and stores data in database.
 * Can be run as a daemon or scheduled task.
 *
 * Installation:
 *   composer require php-mqtt/client
 *
 * Run: php mqtt-consumer.php
 */

require 'vendor/autoload.php';

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\Exceptions\MqttClientException;
use PhpMqtt\Client\Contracts\LoggerInterface;

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'meteran_db');

// MQTT Configuration
define('MQTT_BROKER', '127.0.0.1');
define('MQTT_PORT', 1883);
define('MQTT_CLIENT_ID', 'meteran-consumer-' . gethostname());
define('MQTT_TOPIC', 'meteran/reading');

// Connect to database
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

echo "Starting MQTT Consumer...\n";
echo "Broker: " . MQTT_BROKER . ":" . MQTT_PORT . "\n";
echo "Topic: " . MQTT_TOPIC . "\n\n";

// Create MQTT client
$mqtt = new MqttClient(MQTT_BROKER, MQTT_PORT, MQTT_CLIENT_ID);
$mqtt->setProtocolLevel(4); // MQTT 3.1.1

try {
    $mqtt->connect(true);
    echo "Connected to MQTT broker.\n\n";
} catch (MqttClientException $e) {
    die("Failed to connect to MQTT broker: " . $e->getMessage());
}

// Subscribe to topic
$mqtt->subscribe(MQTT_TOPIC, function ($topic, $message) use ($pdo) {
    echo "Received message on '$topic': $message\n";

    // Parse JSON payload
    $data = json_decode($message, true);
    if (!$data) {
        echo "Invalid JSON, skipping...\n";
        return;
    }

    // Extract data
    $reading = isset($data['reading']) ? intval($data['reading']) : 0;
    $confidence = isset($data['confidence']) ? floatval($data['confidence']) : 0.0;
    $timestamp = isset($data['timestamp']) ? intval($data['timestamp']) : time();
    $battery = isset($data['battery']) ? floatval($data['battery']) : 0.0;

    if ($reading <= 0) {
        echo "Invalid reading, skipping...\n";
        return;
    }

    // Insert reading
    try {
        $stmt = $pdo->prepare("
            INSERT INTO meter_readings (device_id, reading, confidence, reading_date, battery_voltage)
            VALUES (1, :reading, :confidence, FROM_UNIXTIME(:timestamp), :battery)
        ");

        $stmt->execute([
            'reading' => $reading,
            'confidence' => $confidence,
            'timestamp' => $timestamp,
            'battery' => $battery
        ]);

        echo "Reading saved: " . $reading . " m³\n\n";
    } catch (PDOException $e) {
        echo "Failed to save reading: " . $e->getMessage() . "\n\n";
    }
}, 0); // QoS 0

// Keep the consumer running
echo "Listening for messages...\n";
while (true) {
    $mqtt->loop(true);
    sleep(1);
}

// Clean shutdown
$mqtt->disconnect();
echo "MQTT Consumer stopped.\n";
?>
