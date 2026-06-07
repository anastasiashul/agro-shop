<?php
class Logger {
    private static $logFile = __DIR__ . '/../logs/app.log';
    
    public static function log($message, $type = 'INFO') {
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        
        $time = date('Y-m-d H:i:s');
        $logLine = "[$time] [$type] $message" . PHP_EOL;
        file_put_contents(self::$logFile, $logLine, FILE_APPEND);
    }
    
    public static function error($message) {
        self::log($message, 'ERROR');
    }
    
    public static function success($message) {
        self::log($message, 'SUCCESS');
    }
}
?>