<?php
// データベース接続関数を定義
function getDbConnection() {
    $host = 'localhost';
    $dbname = getenv('DB_NAME') ?: '';
    $username = getenv('DB_USER_NAME') ?: '';
    $password = getenv('DB_PASSWORD') ?: '';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die(json_encode(["error" => "Database connection failed: " . $e->getMessage()]));
    }
}

// データ挿入（Setter）関数
function setData($uuid, $is_dev, $answers, $gpt_result) {
    $pdo = getDbConnection();
    $checkSql = "SELECT COUNT(*) FROM shibafes2024 WHERE sub_key = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$uuid]);
    $count = $checkStmt->fetchColumn();

    if ($count > 0) {
        return json_encode(["error" => "UUID already exists"]);
    }

    $sql = "INSERT INTO shibafes2024 (sub_key, is_dev, answers, gpt_result) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $answers_json = json_encode($answers);
    $gpt_result_json = json_encode($gpt_result);

    $success = $stmt->execute([$uuid, $is_dev, $answers_json, $gpt_result_json]);

    if ($success) {
        return json_encode(["success" => "Data inserted successfully"]);
    } else {
        return json_encode(["error" => "Data insertion failed"]);
    }
}

// リクエスト処理
header("Content-Type: application/json");
$requestMethod = $_SERVER['REQUEST_METHOD'];

if ($requestMethod === 'POST') {
    // POSTリクエストのデータを取得してデータを挿入する (Setter)
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['uuid'], $input['is_dev'], $input['answers'], $input['gpt_result'])) {
        $uuid = $input['uuid'];
        $is_dev = (bool)$input['is_dev'];
        $answers = $input['answers'];
        $gpt_result = $input['gpt_result'];

        echo setData($uuid, $is_dev, $answers, $gpt_result);
    } else {
        echo json_encode(["error" => "Invalid input parameters"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}
?>
