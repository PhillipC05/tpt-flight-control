<?php
$dbPath  = __DIR__ . '/flight_control_demo.db';
$schema  = __DIR__ . '/schema-sqlite.sql';

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec(file_get_contents($schema));
    echo "✅ SQLite database ready: $dbPath\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
