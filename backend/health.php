<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

try {
    // A tiny query is enough to prove the backend can reach MySQL.
    db()->query('SELECT 1');

    echo json_encode([
        'ok' => true,
        'message' => 'Backend connected to MySQL.',
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'message' => 'Database connection failed.',
        'error' => $e->getMessage(),
    ]);
}
