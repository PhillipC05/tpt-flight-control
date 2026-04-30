<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../src/Auth.php';

$action = $_GET['action'] ?? '';

// Validate token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!str_starts_with($authHeader, 'Bearer ')) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

switch ($action) {
    case 'stats':
        echo json_encode([
            'success' => true,
            'stats' => [
                'total_flights'          => 142,
                'active_flights'         => 38,
                'total_passengers'       => 18340,
                'checked_in_passengers'  => 4217,
                'total_bookings'         => 9821,
                'pending_maintenance'    => 7,
                'security_alerts'        => 2,
                'system_health'          => 'healthy'
            ]
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
