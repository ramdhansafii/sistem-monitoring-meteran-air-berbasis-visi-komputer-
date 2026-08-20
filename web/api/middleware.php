<?php
/**
 * Authentication Middleware
 * Validate session token from Authorization header
 */

function requireAuth($pdo) {

    $headers = [];

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }

    $authHeader = '';

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    $token = str_replace('Bearer ', '', trim($authHeader));

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.full_name, u.email, u.role, s.expires_at
        FROM user_sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.session_token = ?
        AND s.expires_at > NOW()
        AND u.is_active = TRUE
        LIMIT 1
    ");

    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    return $user;
}

/**
 * Requires the authenticated user to have role = 'admin'.
 * Returns the user array on success, or exits with 403 otherwise.
 */
function requireAdmin($pdo) {
    $user = requireAuth($pdo);

    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.']);
        exit;
    }

    return $user;
}
?>
