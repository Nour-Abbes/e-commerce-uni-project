<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

try {
    $pdo = db();
    // Counting each table is a quick way to verify seed/import work.
    $tables = ['users', 'products', 'orders', 'order_items'];
    $counts = [];

    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) AS total FROM `$table`");
        $counts[$table] = (int)$stmt->fetchColumn();
    }

    echo json_encode([
        'ok' => true,
        'counts' => $counts,
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'message' => 'Database test failed.',
        'error' => $e->getMessage(),
    ]);
}
