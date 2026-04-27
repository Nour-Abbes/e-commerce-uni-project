<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

// Orders depend on the logged-in user stored by auth.php.
session_start();

header('Content-Type: application/json; charset=utf-8');

function send_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function current_user(): ?array
{
    // Central helper keeps permission checks consistent.
    return isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'POST request required.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    send_json(['success' => false, 'message' => 'Invalid JSON.'], 400);
}

$action = trim((string)($input['action'] ?? ''));

try {
    $pdo = db();

    if ($action === 'checkout') {
        $user = current_user();
        $userId = $user['id'] ?? $input['user_id'] ?? null;
        $items = $input['items'] ?? [];

        if (!$userId || !is_numeric($userId)) {
            send_json(['success' => false, 'message' => 'User ID is required.'], 401);
        }

        if (!is_array($items) || count($items) === 0) {
            send_json(['success' => false, 'message' => 'Order items are required.'], 400);
        }

        // A transaction keeps order creation and stock updates together.
        $pdo->beginTransaction();

        $subtotal = 0.0;
        $orderItems = [];
        $productStmt = $pdo->prepare('SELECT id, price, stock FROM products WHERE id = :id LIMIT 1');

        foreach ($items as $item) {
            $productId = $item['product_id'] ?? null;
            $quantity = $item['quantity'] ?? null;

            if (!$productId || !is_numeric($productId) || !$quantity || !is_numeric($quantity) || (int)$quantity < 1) {
                $pdo->rollBack();
                send_json(['success' => false, 'message' => 'Each item needs a valid product_id and quantity.'], 400);
            }

            $productStmt->execute([':id' => (int)$productId]);
            $product = $productStmt->fetch();

            if (!$product) {
                $pdo->rollBack();
                send_json(['success' => false, 'message' => 'Product not found.'], 404);
            }

            // Stock is checked on the server so clients cannot oversell products.
            if ((int)$product['stock'] < (int)$quantity) {
                $pdo->rollBack();
                send_json(['success' => false, 'message' => 'Not enough stock for one or more products.'], 400);
            }

            $unitPrice = (float)$product['price'];
            $lineTotal = $unitPrice * (int)$quantity;
            $subtotal += $lineTotal;

            $orderItems[] = [
                'product_id' => (int)$product['id'],
                'quantity' => (int)$quantity,
                'unit_price' => $unitPrice,
            ];
        }

        $deliveryFee = $subtotal < 500 ? 7.0 : 0.0;
        $total = $subtotal + $deliveryFee;

        $orderStmt = $pdo->prepare(
            'INSERT INTO orders (user_id, subtotal, delivery_fee, total)
             VALUES (:user_id, :subtotal, :delivery_fee, :total)'
        );
        $orderStmt->execute([
            ':user_id' => (int)$userId,
            ':subtotal' => $subtotal,
            ':delivery_fee' => $deliveryFee,
            ':total' => $total,
        ]);

        $orderId = (int)$pdo->lastInsertId();
        $itemStmt = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price)
             VALUES (:order_id, :product_id, :quantity, :unit_price)'
        );
        $stockStmt = $pdo->prepare(
            'UPDATE products SET stock = stock - :quantity WHERE id = :product_id'
        );

        // Each cart line becomes an order_items row, then stock is reduced.
        foreach ($orderItems as $orderItem) {
            $itemStmt->execute([
                ':order_id' => $orderId,
                ':product_id' => $orderItem['product_id'],
                ':quantity' => $orderItem['quantity'],
                ':unit_price' => $orderItem['unit_price'],
            ]);

            $stockStmt->execute([
                ':quantity' => $orderItem['quantity'],
                ':product_id' => $orderItem['product_id'],
            ]);
        }

        $pdo->commit();

        send_json([
            'success' => true,
            'message' => 'Order created.',
            'order_id' => $orderId,
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total' => $total,
        ], 201);
    }

    if ($action === 'history') {
        $user = current_user();
        $userId = $user['id'] ?? $input['user_id'] ?? null;

        if (!$userId || !is_numeric($userId)) {
            send_json(['success' => false, 'message' => 'User ID is required.'], 401);
        }

        // Clients can only request orders for one user id.
        $stmt = $pdo->prepare(
            'SELECT id, status, subtotal, delivery_fee, total, created_at
             FROM orders
             WHERE user_id = :user_id
             ORDER BY id DESC'
        );
        $stmt->execute([':user_id' => (int)$userId]);
        $orders = $stmt->fetchAll();

        $itemsStmt = $pdo->prepare(
            'SELECT oi.product_id, p.name, oi.quantity, oi.unit_price
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = :order_id'
        );

        // Attach item rows so the frontend can reuse its order card UI.
        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $order['subtotal'] = (float)$order['subtotal'];
            $order['delivery_fee'] = (float)$order['delivery_fee'];
            $order['total'] = (float)$order['total'];

            $itemsStmt->execute([':order_id' => $order['id']]);
            $order['items'] = $itemsStmt->fetchAll();

            foreach ($order['items'] as &$item) {
                $item['product_id'] = (int)$item['product_id'];
                $item['quantity'] = (int)$item['quantity'];
                $item['unit_price'] = (float)$item['unit_price'];
            }
        }

        send_json(['success' => true, 'orders' => $orders]);
    }

    if ($action === 'admin_history') {
        $user = current_user();

        // Admin-only checks also live in PHP, not only in JavaScript.
        if (!$user || ($user['role'] ?? '') !== 'admin') {
            send_json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $stmt = $pdo->query(
            'SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email,
                    o.status, o.subtotal, o.delivery_fee, o.total, o.created_at
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ORDER BY o.id DESC'
        );
        $orders = $stmt->fetchAll();

        $itemsStmt = $pdo->prepare(
            'SELECT oi.product_id, p.name, oi.quantity, oi.unit_price
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = :order_id'
        );

        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $order['user_id'] = (int)$order['user_id'];
            $order['subtotal'] = (float)$order['subtotal'];
            $order['delivery_fee'] = (float)$order['delivery_fee'];
            $order['total'] = (float)$order['total'];

            $itemsStmt->execute([':order_id' => $order['id']]);
            $order['items'] = $itemsStmt->fetchAll();

            foreach ($order['items'] as &$item) {
                $item['product_id'] = (int)$item['product_id'];
                $item['quantity'] = (int)$item['quantity'];
                $item['unit_price'] = (float)$item['unit_price'];
            }
        }

        send_json(['success' => true, 'orders' => $orders]);
    }

    if ($action === 'update_status') {
        $user = current_user();

        if (!$user || ($user['role'] ?? '') !== 'admin') {
            send_json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $orderId = $input['order_id'] ?? null;
        $status = trim((string)($input['status'] ?? ''));
        // Limit statuses to known values so the database stays consistent.
        $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!$orderId || !is_numeric($orderId) || !in_array($status, $allowedStatuses, true)) {
            send_json(['success' => false, 'message' => 'Valid order_id and status are required.'], 400);
        }

        $stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
        $stmt->execute([
            ':status' => $status,
            ':id' => (int)$orderId,
        ]);

        send_json(['success' => true, 'message' => 'Order status updated.']);
    }

    send_json(['success' => false, 'message' => 'Unknown action.'], 400);
} catch (PDOException $e) {
    if ($pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    send_json(['success' => false, 'message' => 'Database error.'], 500);
}
