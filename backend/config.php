<?php
declare(strict_types=1);

return [
    // Keeping connection settings here makes db.php reusable by every endpoint.
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'nextronix',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
    ],
];
