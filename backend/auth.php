<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

// The session lets later requests know who is logged in.
session_start();

header('Content-Type: application/json; charset=utf-8');

function send_json(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Auth changes data, so only POST requests are accepted.
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

    if ($action === 'register') {
        $name = trim((string)($input['name'] ?? ''));
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');

        if ($name === '' || $email === '' || $password === '') {
            send_json(['success' => false, 'message' => 'Name, email, and password are required.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            send_json(['success' => false, 'message' => 'Invalid email address.'], 400);
        }

        // Store a hash, never the real password.
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Prepared statements keep user input separate from SQL.
        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, "client")'
        );
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $passwordHash,
        ]);

        // Keep only safe session fields for the frontend.
        $_SESSION['user'] = [
            'id' => (int)$pdo->lastInsertId(),
            'name' => $name,
            'email' => $email,
            'role' => 'client',
        ];

        send_json(['success' => true, 'message' => 'Client registered.', 'user' => $_SESSION['user']]);
    }

    if ($action === 'client_login' || $action === 'admin_login') {
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');
        // Separate login actions prevent a client account from entering admin pages.
        $requiredRole = $action === 'admin_login' ? 'admin' : 'client';

        if ($email === '' || $password === '') {
            send_json(['success' => false, 'message' => 'Email and password are required.'], 400);
        }

        $stmt = $pdo->prepare(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = :email AND role = :role LIMIT 1'
        );
        $stmt->execute([
            ':email' => $email,
            ':role' => $requiredRole,
        ]);

        $user = $stmt->fetch();

        // password_verify compares the typed password with the stored hash.
        if (!$user || !password_verify($password, $user['password_hash'])) {
            send_json(['success' => false, 'message' => 'Invalid email or password.'], 401);
        }

        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];

        send_json(['success' => true, 'message' => 'Login successful.', 'user' => $_SESSION['user']]);
    }

    if ($action === 'logout') {
        $_SESSION = [];

        // Remove the browser session cookie so the server session is fully cleared.
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                (bool)$params['secure'],
                (bool)$params['httponly']
            );
        }

        session_destroy();
        send_json(['success' => true, 'message' => 'Logged out.']);
    }

    send_json(['success' => false, 'message' => 'Unknown action.'], 400);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        send_json(['success' => false, 'message' => 'Email already registered.'], 409);
    }

    send_json(['success' => false, 'message' => 'Database error.'], 500);
}
