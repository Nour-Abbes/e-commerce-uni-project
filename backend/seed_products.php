<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/db.php';

// This script copies the frontend sample catalog into MySQL for testing.
$products = [
    [
        'name' => 'ProBook X15 Laptop',
        'category' => 'Laptops',
        'price' => 3799,
        'old_price' => 4299,
        'description' => 'A powerful all-round laptop for professionals and students with a stunning IPS display and excellent battery life.',
        'image' => 'PROBOOK.avif',
        'stock' => 15,
        'badge' => 'new',
    ],
    [
        'name' => 'UltraSlim Pro 13',
        'category' => 'Laptops',
        'price' => 2899,
        'old_price' => null,
        'description' => 'Ultra-thin and light with exceptional performance. Perfect for on-the-go professionals.',
        'image' => 'ULTRA.avif',
        'stock' => 8,
        'badge' => null,
    ],
    [
        'name' => 'PowerDesk Pro Tower',
        'category' => 'Desktops',
        'price' => 5299,
        'old_price' => 6199,
        'description' => 'Built for gaming, content creation and heavy workloads. No compromises, pure raw performance.',
        'image' => 'POWER.jpg',
        'stock' => 4,
        'badge' => 'sale',
    ],
    [
        'name' => 'MiniDesk Elite',
        'category' => 'Desktops',
        'price' => 2199,
        'old_price' => null,
        'description' => 'Compact desktop powerhouse. Fits anywhere while delivering impressive everyday performance.',
        'image' => 'images.jpg',
        'stock' => 12,
        'badge' => null,
    ],
    [
        'name' => 'CrystalView 27" 4K',
        'category' => 'Monitors',
        'price' => 1599,
        'old_price' => 1899,
        'description' => 'Stunning 4K IPS monitor with HDR600 support. Perfect for design, gaming and media.',
        'image' => 'CRYSTAL.jpg',
        'stock' => 20,
        'badge' => 'sale',
    ],
    [
        'name' => 'ProDisplay 32" Curved',
        'category' => 'Monitors',
        'price' => 2299,
        'old_price' => null,
        'description' => 'Immersive 32" curved display for ultra-wide viewing. Great for multitasking and gaming.',
        'image' => 'CURVED.jpg',
        'stock' => 7,
        'badge' => null,
    ],
    [
        'name' => 'MechType Pro RGB',
        'category' => 'Keyboards',
        'price' => 429,
        'old_price' => 519,
        'description' => 'Full mechanical keyboard with Cherry MX Red switches. Per-key RGB for the ultimate setup.',
        'image' => 'images (1).jpg',
        'stock' => 30,
        'badge' => 'new',
    ],
    [
        'name' => 'TactileBoard Slim 75%',
        'category' => 'Keyboards',
        'price' => 259,
        'old_price' => null,
        'description' => 'Low-profile mechanical keyboard in compact 75% layout. Great desk-space saving.',
        'image' => 'mekanic.jpg',
        'stock' => 25,
        'badge' => null,
    ],
    [
        'name' => 'PrecisionGlide Pro',
        'category' => 'Mouse',
        'price' => 229,
        'old_price' => 289,
        'description' => 'High-performance gaming mouse with 25,600 DPI optical sensor and ergonomic right-hand design.',
        'image' => 'mouse.jpg',
        'stock' => 18,
        'badge' => 'sale',
    ],
    [
        'name' => 'Logitech Wireless',
        'category' => 'Mouse',
        'price' => 169,
        'old_price' => null,
        'description' => 'Ergonomic vertical mouse to reduce wrist strain during long sessions. 2-year battery life.',
        'image' => 'logi.avif',
        'stock' => 3,
        'badge' => null,
    ],
    [
        'name' => 'ProPad XXL RGB',
        'category' => 'Accessories',
        'price' => 85,
        'old_price' => null,
        'description' => 'Extended gaming mouse pad 900x400mm with non-slip rubber base and RGB edge lighting.',
        'image' => 'padd.webp',
        'stock' => 50,
        'badge' => null,
    ],
    [
        'name' => 'USB-C 11-in-1 Hub',
        'category' => 'Accessories',
        'price' => 199,
        'old_price' => 259,
        'description' => 'Expand your USB-C port into 11 useful connections. 4K HDMI, 100W PD, USB 3.2, SD, Ethernet.',
        'image' => 'usb.jpg',
        'stock' => 22,
        'badge' => 'new',
    ],
    [
        'name' => 'HyperCool Laptop Stand',
        'category' => 'Accessories',
        'price' => 145,
        'old_price' => null,
        'description' => 'Adjustable aluminum stand with built-in cooling fan. Keeps your laptop at the perfect angle.',
        'image' => 'support.jpg',
        'stock' => 14,
        'badge' => null,
    ],
    [
        'name' => 'SoundWave Pro Headset',
        'category' => 'Accessories',
        'price' => 379,
        'old_price' => 459,
        'description' => 'Wireless headset with 7.1 surround sound and active noise cancellation. 50h battery life.',
        'image' => 'headphones.jpg',
        'stock' => 9,
        'badge' => 'sale',
    ],
];

try {
    $pdo = db();
    // The transaction keeps the seed run all-or-nothing.
    $pdo->beginTransaction();

    $exists = $pdo->prepare(
        'SELECT id FROM products WHERE name = :name AND category = :category LIMIT 1'
    );
    $insert = $pdo->prepare(
        'INSERT INTO products
            (name, category, price, old_price, description, image, stock, badge)
         VALUES
            (:name, :category, :price, :old_price, :description, :image, :stock, :badge)'
    );

    $inserted = 0;
    $skipped = 0;

    foreach ($products as $product) {
        // Skipping existing rows prevents duplicates when the script is rerun.
        $exists->execute([
            ':name' => $product['name'],
            ':category' => $product['category'],
        ]);

        if ($exists->fetchColumn()) {
            $skipped++;
            continue;
        }

        $insert->execute([
            ':name' => $product['name'],
            ':category' => $product['category'],
            ':price' => $product['price'],
            ':old_price' => $product['old_price'],
            ':description' => $product['description'],
            ':image' => $product['image'],
            ':stock' => $product['stock'],
            ':badge' => $product['badge'],
        ]);
        $inserted++;
    }

    $pdo->commit();

    echo json_encode([
        'ok' => true,
        'inserted' => $inserted,
        'skipped' => $skipped,
        'total' => count($products),
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'ok' => false,
        'message' => 'Product seed failed.',
        'error' => $e->getMessage(),
    ]);
}
