<?php
/**
 * Image Preprocessing for OCR
 *
 * Preprocesses captured images to improve Tesseract OCR accuracy.
 * Uses ImageMagick/GD for image manipulation before OCR.
 *
 * Pipeline:
 * 1. Convert to grayscale
 * 2. Apply adaptive threshold (binary)
 * 3. Denoise
 * 4. Increase contrast
 * 5. Scale up for better digit recognition
 */

// Check if required extensions are available
function checkPrerequisites() {
    $missing = [];

    if (!extension_loaded('gd') && !extension_loaded('imagick')) {
        $missing[] = 'GD or Imagick extension';
    }

    if (!function_exists('exec') && !function_exists('shell_exec')) {
        $missing[] = 'exec() or shell_exec() function';
    }

    if (!empty($missing)) {
        return ['available' => false, 'missing' => $missing];
    }

    // Check Tesseract installation
    $tesseractPath = getTesseractPath();
    if (!$tesseractPath) {
        $missing[] = 'Tesseract executable';
        return ['available' => false, 'missing' => $missing];
    }

    return ['available' => true, 'tesseract' => $tesseractPath];
}

/**
 * Get Tesseract executable path (auto-detect on Windows)
 */
function getTesseractPath() {
    $paths = [
        'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
        'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
        'tesseract',  // If in PATH
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            return $path;
        }
    }

    return false;
}

/**
 * Preprocess image for OCR using GD library
 */
function preprocessWithGD($inputPath, $outputPath) {
    if (!extension_loaded('gd')) {
        return false;
    }

    // Load image
    $image = loadImage($inputPath);
    if (!$image) {
        return false;
    }

    // Get dimensions
    $width = imagesx($image);
    $height = imagesy($image);

    // Step 1: Convert to grayscale
    $grayscale = imagecreatetruecolor($width, $height);
    imagecolortransparent($grayscale, imagecolorallocate($grayscale, 0, 0, 0));

    for ($x = 0; $x < $width; $x++) {
        for ($y = 0; $y < $height; $y++) {
            $rgb = imagecolorat($image, $x, $y);
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8) & 0xFF;
            $b = $rgb & 0xFF;

            // Convert to grayscale using luminance formula
            $gray = (int)(0.299 * $r + 0.587 * $g + 0.114 * $b);

            // Create gray color
            $color = imagecolorallocate($grayscale, $gray, $gray, $gray);
            imagesetpixel($grayscale, $x, $y, $color);
        }
    }

    // Step 2: Adaptive threshold (binary)
    // Use Otsu's method approximation
    $threshold = calculateOtsuThreshold($grayscale, $width, $height);

    $binary = imagecreatetruecolor($width, $height);
    for ($x = 0; $x < $width; $x++) {
        for ($y = 0; $y < $height; $y++) {
            $rgb = imagecolorat($grayscale, $x, $y);
            $gray = ($rgb >> 8) & 0xFF;

            $color = $gray < $threshold ? imagecolorallocate($binary, 0, 0, 0) : imagecolorallocate($binary, 255, 255, 255);
            imagesetpixel($binary, $x, $y, $color);
        }
    }

    // Step 3: Denoise (simple median filter)
    $denoised = denoise($binary, $width, $height);

    // Step 4: Scale up (2x) for better OCR
    $scaledWidth = $width * 2;
    $scaledHeight = $height * 2;
    $scaled = imagecreatetruecolor($scaledWidth, $scaledHeight);

    imagecopyresampled($scaled, $denoised, 0, 0, 0, 0, $scaledWidth, $scaledHeight, $width, $height);

    // Save as PNG for best OCR quality
    imagepng($scaled, $outputPath, 9);

    // Free memory
    imagedestroy($image);
    imagedestroy($grayscale);
    imagedestroy($binary);
    imagedestroy($denoised);
    imagedestroy($scaled);

    return true;
}

/**
 * Calculate Otsu threshold for binary image
 */
function calculateOtsuThreshold($image, $width, $height) {
    // Build histogram
    $histogram = array_fill(0, 256, 0);

    for ($x = 0; $x < $width; $x++) {
        for ($y = 0; $y < $height; $y++) {
            $rgb = imagecolorat($image, $x, $y);
            $gray = ($rgb >> 8) & 0xFF;
            $histogram[$gray]++;
        }
    }

    // Total pixels
    $total = $width * $height;

    // Find optimal threshold using Otsu's method
    $maxVariance = 0;
    $optimalThreshold = 128;

    for ($t = 0; $t < 256; $t++) {
        $w0 = 0;
        $w1 = 0;
        $sum0 = 0;
        $sum1 = 0;

        for ($i = 0; $i < 256; $i++) {
            if ($i <= $t) {
                $w0 += $histogram[$i];
                $sum0 += $i * $histogram[$i];
            } else {
                $w1 += $histogram[$i];
                $sum1 += $i * $histogram[$i];
            }
        }

        if ($w0 == 0 || $w1 == 0) continue;

        $mean0 = $sum0 / $w0;
        $mean1 = $sum1 / $w1;

        $betweenVar = $w0 * $w1 * pow($mean0 - $mean1, 2);

        if ($betweenVar > $maxVariance) {
            $maxVariance = $betweenVar;
            $optimalThreshold = $t;
        }
    }

    return $optimalThreshold;
}

/**
 * Simple denoise using neighbor averaging
 */
function denoise($image, $width, $height) {
    $denoised = imagecreatetruecolor($width, $height);

    for ($x = 0; $x < $width; $x++) {
        for ($y = 0; $y < $height; $y++) {
            $sum = 0;
            $count = 0;

            // Check 3x3 neighborhood
            for ($dx = -1; $dx <= 1; $dx++) {
                for ($dy = -1; $dy <= 1; $dy++) {
                    $nx = $x + $dx;
                    $ny = $y + $dy;

                    if ($nx >= 0 && $nx < $width && $ny >= 0 && $ny < $height) {
                        $rgb = imagecolorat($image, $nx, $ny);
                        $gray = ($rgb >> 8) & 0xFF;
                        $sum += $gray;
                        $count++;
                    }
                }
            }

            $avg = (int)($sum / $count);
            $color = imagecolorallocate($denoised, $avg, $avg, $avg);
            imagesetpixel($denoised, $x, $y, $color);
        }
    }

    return $denoised;
}

/**
 * Preprocess image using ImageMagick (better quality)
 */
function preprocessWithImageMagick($inputPath, $outputPath) {
    if (!extension_loaded('imagick')) {
        return false;
    }

    try {
        $imagick = new Imagick(realpath($inputPath));

        // Convert to grayscale
        $imagick->transformImageColorspace(Imagick::COLORSPACE_GRAY);

        // Adaptive threshold
        $imagick->thresholdImage(0.3);

        // Denoise
        $imagick->despeckleImage();

        // Scale up 2x
        $imagick->resizeImage(
            $imagick->getImageWidth() * 2,
            $imagick->getImageHeight() * 2,
            Imagick::FILTER_LANCZOS,
            1
        );

        // Set page timing and geometric properties for Tesseract
        $imagick->setImageBackgroundColor('white');
        $imagick->flattenImages();

        // Save as PNG
        $imagick->setImageFormat('png');
        $imagick->writeImage($outputPath);

        $imagick->destroy();
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Crop image to focus on meter display area
 */
function cropMeterArea($inputPath, $outputPath, $xPercent = 25, $yPercent = 20, $widthPercent = 50, $heightPercent = 30) {
    $image = loadImage($inputPath);
    if (!$image) {
        return false;
    }

    $width = imagesx($image);
    $height = imagesy($image);

    // Calculate crop coordinates
    $cropX = (int)($width * $xPercent / 100);
    $cropY = (int)($height * $yPercent / 100);
    $cropWidth = (int)($width * $widthPercent / 100);
    $cropHeight = (int)($height * $heightPercent / 100);

    // Create cropped image
    $cropped = imagecreatetruecolor($cropWidth, $cropHeight);
    imagecopy($cropped, $image, 0, 0, $cropX, $cropY, $cropWidth, $cropHeight);

    // Save
    imagepng($cropped, $outputPath, 9);

    imagedestroy($image);
    imagedestroy($cropped);

    return true;
}

/**
 * Load image from file
 */
function loadImage($path) {
    if (!file_exists($path)) {
        return false;
    }

    $info = getimagesize($path);
    if (!$info) {
        return false;
    }

    $mime = $info['mime'];

    switch ($mime) {
        case 'image/jpeg':
            return imagecreatefromjpeg($path);
        case 'image/png':
            return imagecreatefrompng($path);
        case 'image/gif':
            return imagecreatefromgif($path);
        default:
            return imagecreatefromstring(file_get_contents($path));
    }
}
