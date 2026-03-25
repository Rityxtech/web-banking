# ⚠️ SYSTEM CONTEXT: MVP BAAS BACKEND RULES

This application connects to a WordPress Zero-Load Backend ("MVP BaaS").

## 1. CRITICAL: UPDATING YOUR PLUGIN CODE
The previous backend code had a bug where it forgot to define `MVP_ACCESS` before loading the config, causing immediate "Access Denied" errors.

**Instructions:**
1. Log in to your WordPress Admin.
2. Go to **Plugins > Plugin File Editor**.
3. Select **MVP BaaS** from the dropdown.
4. Open the `mvp-baas.php` file.
5. Find the function `get_router_code()` (near the bottom).
6. **REPLACE** the return string with the code below.
7. Click **Update File**.
8. Go to **MVP BaaS** menu and click **"Update Config"**.

## 2. THE CORRECT PHP ROUTER CODE (V5.8)

```php
<?php
// api.php - Bulletproof Version V5.8 (Access Fix + Text/Plain Support)
error_reporting(0);
ini_set('display_errors', 0);

// 1. Dynamic CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Action");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(0); }

// 2. Input Parsing (Supports text/plain to bypass WAF)
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true) ?? [];
$op = $input['op'] ?? $_GET['op'] ?? 'read';

// 3. Health Check (Pre-Config)
if ($op === 'health') { 
    echo json_encode(["status" => "ok", "mode" => "v5.8", "ts" => time()]); 
    exit; 
}

try {
    // 4. Load Config (CRITICAL FIX: Define Access Constant)
    if (!file_exists('mvp-config.php')) throw new Exception("Config missing");
    
    define('MVP_ACCESS', true); // <--- FIX IS HERE
    $config = require 'mvp-config.php';

    // 5. Load WordPress
    $wp_load_paths = [__DIR__ . '/../../../wp-load.php', $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php'];
    foreach ($wp_load_paths as $path) { if (file_exists($path)) { @include_once($path); break; } }

    $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // 6. Auth
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    if (!$authHeader && function_exists('apache_request_headers')) { 
        $h = array_change_key_case(apache_request_headers(), CASE_LOWER); 
        $authHeader = $h['authorization'] ?? null; 
    }
    
    $table = $input['table'] ?? $_GET['table'] ?? '';
    $isPublic = ($table === 'mvp_app_settings' || $table === 'mvp_waitlist');

    if (!$authHeader && !$isPublic) throw new Exception("Missing Auth Header");
    
    $UID = 'PUBLIC';
    if ($authHeader) {
        $jwt = str_replace('Bearer ', '', $authHeader);
        $parts = explode('.', $jwt);
        if (count($parts) == 3) {
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
            if ($payload) { $UID = $payload['sub']; }
        }
    }

    $id = $input['id'] ?? $_GET['id'] ?? null;
    $data = $input['data'] ?? [];
    $response = [];

    if ($op !== 'sync_user' && (empty($table) || strpos($table, 'mvp_') !== 0)) throw new Exception("Invalid table access");

    switch ($op) {
        case 'sync_user':
            $stmt = $pdo->prepare("INSERT INTO mvp_users (supabase_uid, email, full_name, avatar_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), email=VALUES(email), avatar_url=VALUES(avatar_url)");
            $stmt->execute([$UID, $input['email']??'', $data['full_name']??'User', $data['avatar_url']??'']);
            $response = ["success" => true]; break;
        case 'create':
            $cols = array_keys($data); $vals = array_values($data); $placeholders = str_repeat('?,', count($cols) - 1) . '?';
            $stmt = $pdo->prepare("INSERT INTO `$table` (" . implode(',', $cols) . ") VALUES ($placeholders)"); 
            $stmt->execute($vals);
            $response = ["success" => true, "id" => $pdo->lastInsertId()]; break;
        case 'update':
            if (!$id) throw new Exception("ID required"); 
            $setParts = []; $vals = []; foreach ($data as $k => $v) { $setParts[] = "$k = ?"; $vals[] = $v; } $vals[] = $id;
            $stmt = $pdo->prepare("UPDATE `$table` SET " . implode(', ', $setParts) . " WHERE id = ?"); 
            $stmt->execute($vals);
            $response = ["success" => true, "id" => $id]; break;
        case 'delete':
            if (!$id) throw new Exception("ID required");
            $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?"); $stmt->execute([$id]);
            $response = ["success" => true]; break;
        case 'read': default:
            $reqCols = $input['columns'] ?? $_GET['columns'] ?? '*';
            if($reqCols !== '*' && !preg_match('/^[a-zA-Z0-9_,]+$/', $reqCols)) $reqCols = '*';
            $sql = "SELECT $reqCols FROM `$table`"; $params = [];
            
            $userIdFilter = $input['user_id'] ?? $_GET['user_id'] ?? null;
            if ($userIdFilter) { 
                $col = ($table === 'mvp_users') ? 'supabase_uid' : 'user_id';
                $sql .= " WHERE $col = ?";
                $params[] = ($userIdFilter === 'ME') ? $UID : $userIdFilter;
            } elseif ($id) { 
                $sql .= " WHERE id = ?"; $params[] = $id; 
            }
            
            $limit = isset($input['limit']) ? (int)$input['limit'] : (isset($_GET['limit']) ? (int)$_GET['limit'] : 50);
            $offset = isset($input['offset']) ? (int)$input['offset'] : (isset($_GET['offset']) ? (int)$_GET['offset'] : 0);
            
            $sql .= " ORDER BY id DESC LIMIT $limit OFFSET $offset";
            $stmt = $pdo->prepare($sql); $stmt->execute($params); $response = $stmt->fetchAll(); break;
    }
    echo json_encode($response);
} catch (Exception $e) { http_response_code(400); echo json_encode(["error" => $e->getMessage()]); }
?>
```