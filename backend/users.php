<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

// Account management needs the admin session created during login.
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
    // Reading the session in one place keeps permission checks simple.
    return isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'POST request required.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    send_json(['success' => false, 'message' => 'Invalid JSON.'], 400);
}

$user = current_user();

// Never trust the frontend alone for admin permissions.
if (!$user || ($user['role'] ?? '') !== 'admin') {
    send_json(['success' => false, 'message' => 'Admin access required.'], 403);
}

$action = trim((string)($input['action'] ?? ''));

try {
    $pdo = db();

    if ($action === 'list') {
        // Count orders here so the frontend can decide which clients are deletable.
        $stmt = $pdo->query(
            'SELECT u.id, u.name, u.email, u.role, COUNT(o.id) AS order_count
             FROM users u
             LEFT JOIN orders o ON o.user_id = u.id
             GROUP BY u.id, u.name, u.email, u.role
             ORDER BY u.id ASC'
        );

        $users = $stmt->fetchAll();

        foreach ($users as &$row) {
            $row['id'] = (int)$row['id'];
            $row['order_count'] = (int)$row['order_count'];
        }
        unset($row);

        send_json(['success' => true, 'users' => $users]);
    }

    if ($action === 'delete') {
        $id = $input['id'] ?? null;

        if (!$id || !is_numeric($id)) {
            send_json(['success' => false, 'message' => 'User ID is required.'], 400);
        }

        $id = (int)$id;

        // These rules protect important accounts and existing order history.
        if ($id === (int)$user['id']) {
            send_json(['success' => false, 'message' => 'You cannot delete your own account.'], 400);
        }

        $stmt = $pdo->prepare(
            'SELECT u.id, u.name, u.role, COUNT(o.id) AS order_count
             FROM users u
             LEFT JOIN orders o ON o.user_id = u.id
             WHERE u.id = :id
             GROUP BY u.id, u.name, u.role
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $target = $stmt->fetch();

        if (!$target) {
            send_json(['success' => false, 'message' => 'Account not found.'], 404);
        }

        if (($target['role'] ?? '') === 'admin') {
            send_json(['success' => false, 'message' => 'Cannot delete another admin account.'], 400);
        }

        if ((int)$target['order_count'] > 0) {
            send_json(['success' => false, 'message' => 'Cannot delete: this client has existing orders.'], 400);
        }

        // The role condition is a final safety check before deleting.
        $delete = $pdo->prepare('DELETE FROM users WHERE id = :id AND role = "client"');
        $delete->execute([':id' => $id]);

        send_json(['success' => true, 'message' => 'Account deleted.']);
    }

    send_json(['success' => false, 'message' => 'Unknown action.'], 400);
} catch (PDOException $e) {
    send_json(['success' => false, 'message' => 'Database error.'], 500);
}
