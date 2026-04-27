<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function send_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function nullable_string(array $input, string $key): ?string
{
    // Empty strings become NULL so optional columns stay clean in MySQL.
    if (!isset($input[$key])) {
        return null;
    }

    $value = trim((string)$input[$key]);
    return $value === '' ? null : $value;
}

function list_products(PDO $pdo): array
{
    // The frontend expects every product field needed for cards and admin tables.
    $stmt = $pdo->query(
        'SELECT id, name, category, price, old_price, description, image, badge, stock, specs
         FROM products
         ORDER BY id DESC'
    );

    $products = $stmt->fetchAll();

    foreach ($products as &$product) {
        // MySQL returns strings; JSON should use numbers where the app expects numbers.
        $product['id'] = (int)$product['id'];
        $product['price'] = (float)$product['price'];
        $product['old_price'] = $product['old_price'] === null ? null : (float)$product['old_price'];
        $product['stock'] = (int)$product['stock'];
        $product['specs'] = $product['specs'] ? json_decode($product['specs'], true) : null;
    }
    unset($product);

    return $products;
}

try {
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Public product browsing uses GET because it only reads data.
        $action = trim((string)($_GET['action'] ?? ''));

        if ($action === 'list') {
            send_json(['ok' => true, 'products' => list_products($pdo)]);
        }

        send_json(['ok' => false, 'message' => 'Unknown action.'], 400);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(['success' => false, 'message' => 'POST request required.'], 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        send_json(['success' => false, 'message' => 'Invalid JSON.'], 400);
    }

    $action = trim((string)($input['action'] ?? ''));

    if ($action === 'list') {
        send_json(['success' => true, 'products' => list_products($pdo)]);
    }

    if ($action === 'create') {
        $name = trim((string)($input['name'] ?? ''));
        $category = trim((string)($input['category'] ?? ''));
        $price = $input['price'] ?? null;
        $stock = $input['stock'] ?? 0;

        if ($name === '' || $category === '' || $price === null || !is_numeric($price)) {
            send_json(['success' => false, 'message' => 'Name, category, and price are required.'], 400);
        }

        $specs = $input['specs'] ?? null;
        // Specs are stored as JSON because each product can have different fields.
        $specsJson = $specs === null ? null : json_encode($specs);

        $stmt = $pdo->prepare(
            'INSERT INTO products
                (name, category, price, old_price, description, image, badge, stock, specs)
             VALUES
                (:name, :category, :price, :old_price, :description, :image, :badge, :stock, :specs)'
        );
        $stmt->execute([
            ':name' => $name,
            ':category' => $category,
            ':price' => (float)$price,
            ':old_price' => isset($input['old_price']) && is_numeric($input['old_price']) ? (float)$input['old_price'] : null,
            ':description' => nullable_string($input, 'description'),
            ':image' => nullable_string($input, 'image'),
            ':badge' => nullable_string($input, 'badge'),
            ':stock' => is_numeric($stock) ? (int)$stock : 0,
            ':specs' => $specsJson,
        ]);

        send_json([
            'success' => true,
            'message' => 'Product created.',
            'id' => (int)$pdo->lastInsertId(),
        ], 201);
    }

    if ($action === 'update') {
        $id = $input['id'] ?? null;
        $name = trim((string)($input['name'] ?? ''));
        $category = trim((string)($input['category'] ?? ''));
        $price = $input['price'] ?? null;
        $stock = $input['stock'] ?? 0;

        if (!$id || !is_numeric($id) || $name === '' || $category === '' || $price === null || !is_numeric($price)) {
            send_json(['success' => false, 'message' => 'ID, name, category, and price are required.'], 400);
        }

        $specs = $input['specs'] ?? null;
        $specsJson = $specs === null ? null : json_encode($specs);

        // Only the selected product id is updated.
        $stmt = $pdo->prepare(
            'UPDATE products
             SET name = :name,
                 category = :category,
                 price = :price,
                 old_price = :old_price,
                 description = :description,
                 image = :image,
                 badge = :badge,
                 stock = :stock,
                 specs = :specs
             WHERE id = :id'
        );
        $stmt->execute([
            ':id' => (int)$id,
            ':name' => $name,
            ':category' => $category,
            ':price' => (float)$price,
            ':old_price' => isset($input['old_price']) && is_numeric($input['old_price']) ? (float)$input['old_price'] : null,
            ':description' => nullable_string($input, 'description'),
            ':image' => nullable_string($input, 'image'),
            ':badge' => nullable_string($input, 'badge'),
            ':stock' => is_numeric($stock) ? (int)$stock : 0,
            ':specs' => $specsJson,
        ]);

        send_json(['success' => true, 'message' => 'Product updated.']);
    }

    if ($action === 'delete') {
        $id = $input['id'] ?? null;

        if (!$id || !is_numeric($id)) {
            send_json(['success' => false, 'message' => 'Product ID is required.'], 400);
        }

        // Product deletion is kept server-side so the database remains the source of truth.
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute([':id' => (int)$id]);

        send_json(['success' => true, 'message' => 'Product deleted.']);
    }

    send_json(['success' => false, 'message' => 'Unknown action.'], 400);
} catch (PDOException $e) {
    send_json(['success' => false, 'message' => 'Database error.'], 500);
}
