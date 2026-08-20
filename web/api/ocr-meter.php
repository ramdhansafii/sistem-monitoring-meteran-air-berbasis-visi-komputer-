<?php
/**
 * Tesseract OCR for Water Meter Reading
 *
 * Reads 6-digit numbers from water meter images using Tesseract OCR.
 * Optimized specifically for water meter digit recognition.
 *
 * Usage:
 *   php ocr-meter.php /path/to/image.jpg
 */

// Configuration
define('TESSERACT_PATH', getTesseractPath());
define('TESSDATA_PATH', dirname(TESSERACT_PATH) . '\\tessdata');
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('TEMP_DIR', UPLOAD_DIR . 'temp/');

require_once __DIR__ . '/preprocess-image.php';

/**
 * Get Tesseract executable path
 */
function getTesseractPath() {
    $paths = [
        'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
        'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            return $path;
        }
    }

    return 'tesseract';
}

/**
 * Initialize Tesseract OCR engine
 */
function initTesseract() {
    if (!file_exists(TESSERACT_PATH)) {
        return false;
    }

    // Create directories
    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }
    if (!file_exists(TEMP_DIR)) {
        mkdir(TEMP_DIR, 0755, true);
    }

    return true;
}

/**
 * Preprocess image for optimal OCR
 */
function preprocessForOCR($inputPath) {
    $outputPath = TEMP_DIR . 'preprocessed_' . time() . '.png';

    // Try ImageMagick first (better quality), fallback to GD
    if (extension_loaded('imagick')) {
        if (preprocessWithImageMagick($inputPath, $outputPath)) {
            return $outputPath;
        }
    }

    if (preprocessWithGD($inputPath, $outputPath)) {
        return $outputPath;
    }

    // Fallback: just copy the file
    copy($inputPath, $outputPath);
    return $outputPath;
}

/**
 * Run Tesseract OCR on preprocessed image
 */
function runTesseract($preprocessedPath) {
    $outputBase = TEMP_DIR . 'ocr_' . time();

    // Build Tesseract command
    $cmd = sprintf(
        '"%s" "%s" "%s" --psm 7 -c tessedit_char_whitelist=0123456789',
        TESSERACT_PATH,
        $preprocessedPath,
        $outputBase
    );

    // Execute and capture output
    $output = [];
    $returnCode = 0;
    exec($cmd, $output, $returnCode);

    // Read the output text file
    $resultFile = $outputBase . '.txt';
    if (file_exists($resultFile)) {
        $text = file_get_contents($resultFile);
        unlink($resultFile);
        return trim($text);
    }

    return '';
}

/**
 * Extract 6-digit meter reading from OCR text
 */
function extractMeterReading($ocrText) {
    // Remove all non-numeric characters
    $numbers = preg_replace('/[^0-9]/', '', $ocrText);

    // Find the first 6-digit sequence
    if (preg_match('/(\d{6})/', $numbers, $matches)) {
        return (int)$matches[1];
    }

    // Fallback: try to find any 5-7 digit sequence
    if (preg_match('/(\d{5,7})/', $numbers, $matches)) {
        $num = (int)$matches[1];
        // Normalize to 6 digits
        if (strlen($matches[1]) > 6) {
            $num = $num % 1000000;
        }
        return $num;
    }

    return null;
}

/**
 * Calculate OCR confidence score
 */
function calculateConfidence($ocrText, $extractedNumber) {
    if (!$extractedNumber || !$ocrText) {
        return 0.0;
    }

    $expected = str_pad((string)$extractedNumber, 6, '0', STR_PAD_LEFT);
    $cleanText = preg_replace('/[^0-9]/', '', $ocrText);

    if (strlen($cleanText) < 6) {
        return 0.3; // Low confidence: not enough digits
    }

    // Character-by-character comparison
    $correct = 0;
    $total = min(6, strlen($cleanText));

    for ($i = 0; $i < $total; $i++) {
        if ($i < strlen($expected) && isset($cleanText[$i]) && $cleanText[$i] === $expected[$i]) {
            $correct++;
        }
    }

    return $correct / $total;
}

/**
 * Main OCR function - process a water meter image
 */
function processMeterImage($inputPath) {
    // Initialize
    if (!initTesseract()) {
        return [
            'success' => false,
            'error' => 'Tesseract not found or directories cannot be created'
        ];
    }

    if (!file_exists($inputPath)) {
        return [
            'success' => false,
            'error' => 'Image file not found'
        ];
    }

    // Step 1: Preprocess
    $preprocessedPath = preprocessForOCR($inputPath);

    // Step 2: Run Tesseract OCR
    $ocrText = runTesseract($preprocessedPath);

    // Step 3: Extract meter reading
    $reading = extractMeterReading($ocrText);

    // Step 4: Calculate confidence
    $confidence = calculateConfidence($ocrText, $reading);

    // Step 5: Clean up
    if (file_exists($preprocessedPath)) {
        unlink($preprocessedPath);
    }

    // Return result
    return [
        'success' => $reading !== null,
        'ocr_text' => $ocrText,
        'reading' => $reading,
        'confidence' => $confidence,
        'digits' => $reading ? str_split(str_pad((string)$reading, 6, '0', STR_PAD_LEFT)) : [],
        'timestamp' => time()
    ];
}

/**
 * CLI Usage
 */
if (php_sapi_name() === 'cli') {
    if (!isset($argv[1])) {
        echo "Usage: php ocr-meter.php <image_path>\n";
        echo "Example: php ocr-meter.php meter-photo.jpg\n";
        exit(1);
    }

    $imagePath = $argv[1];
    echo "Processing: $imagePath\n";

    $result = processMeterImage($imagePath);

    if ($result['success']) {
        echo "\n=== OCR Result ===\n";
        echo "Raw OCR:    " . ($result['ocr_text'] ?: '(empty)') . "\n";
        echo "Reading:    " . $result['reading'] . "\n";
        echo "Confidence: " . round($result['confidence'] * 100, 1) . "%\n";
        echo "Digits:     " . implode(' ', $result['digits']) . "\n";
    } else {
        echo "\nError: " . $result['error'] . "\n";
        exit(1);
    }
}

/**
 * API Usage (when called from web)
 */
if (php_sapi_name() === 'apache2handler' || php_sapi_name() === 'cli') {
    // This function can be included from other scripts
}
