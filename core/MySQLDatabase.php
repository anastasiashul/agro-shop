<?php

class MySQLDatabase {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        $host = 'localhost';
        $dbname = 'agro_shop';
        $username = 'root';
        $password = '';
        
        try {
            $this->pdo = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password
            );
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            $this->pdo->exec("SET time_zone = '+03:00'");
            $this->initDatabase();
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new MySQLDatabase();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
    
    private function initDatabase() {
        $this->pdo->exec("CREATE DATABASE IF NOT EXISTS agro_shop");
        $this->pdo->exec("USE agro_shop");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(64) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(128) NOT NULL,
                age INT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS machines (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(128) NOT NULL,
                category VARCHAR(64) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                description TEXT,
                image VARCHAR(255),
                stock INT DEFAULT 0,
                created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
                updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
            )
        ");
        
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                paid_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                machine_id INT NOT NULL,
                name VARCHAR(128) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (machine_id) REFERENCES machines(id)
            )
        ");

        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS carts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL UNIQUE,
                items TEXT NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");

        $this->pdo->exec("
            CREATE OR REPLACE VIEW v_machines_stats AS
            SELECT 
                m.id, m.name, m.category, m.price, m.stock,
                COALESCE(SUM(oi.quantity), 0) as total_ordered
            FROM machines m
            LEFT JOIN order_items oi ON m.id = oi.machine_id
            GROUP BY m.id
        ");
        
        $this->pdo->exec("
            CREATE OR REPLACE VIEW v_user_orders_stats AS
            SELECT 
                u.id, u.username,
                COUNT(o.id) as orders_count,
                COALESCE(SUM(o.total), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
        ");
        
        $this->pdo->exec("
            CREATE OR REPLACE VIEW v_orders_details AS
            SELECT 
                o.id as order_id,
                o.user_id,
                u.username,
                o.total,
                o.status,
                o.created_at,
                o.paid_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
        ");
        
        $this->pdo->exec("
            CREATE FUNCTION IF NOT EXISTS fn_user_orders_count(user_id INT)
            RETURNS INT
            DETERMINISTIC
            BEGIN
                RETURN (SELECT COUNT(*) FROM orders WHERE orders.user_id = user_id);
            END
        ");
        
        $this->pdo->exec("
            CREATE FUNCTION IF NOT EXISTS fn_user_total_spent(user_id INT)
            RETURNS DECIMAL(10,2)
            DETERMINISTIC
            BEGIN
                RETURN (SELECT COALESCE(SUM(total), 0) FROM orders WHERE orders.user_id = user_id);
            END
        ");
        
        $this->pdo->exec("
            CREATE FUNCTION IF NOT EXISTS fn_machine_stock(machine_id INT)
            RETURNS INT
            DETERMINISTIC
            BEGIN
                RETURN (SELECT COALESCE(stock, 0) FROM machines WHERE id = machine_id);
            END
        ");
        
        $this->pdo->exec("
            CREATE PROCEDURE IF NOT EXISTS sp_create_order(
                IN p_user_id INT,
                IN p_total DECIMAL(10,2),
                OUT p_order_id INT
            )
            BEGIN
                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    ROLLBACK;
                    RESIGNAL;
                END;
                
                START TRANSACTION;
                
                IF EXISTS (SELECT 1 FROM orders WHERE user_id = p_user_id AND status = 'pending') THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'У вас уже есть неоплаченный заказ';
                END IF;
                
                INSERT INTO orders (user_id, total) VALUES (p_user_id, p_total);
                SET p_order_id = LAST_INSERT_ID();
                
                COMMIT;
            END
        ");
        
        $this->pdo->exec("
            CREATE PROCEDURE IF NOT EXISTS sp_pay_order(
                IN p_order_id INT,
                IN p_user_id INT,
                OUT p_success BOOLEAN
            )
            BEGIN
                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    ROLLBACK;
                    SET p_success = FALSE;
                END;
                START TRANSACTION;
                UPDATE orders 
                SET status = 'paid', paid_at = NOW() 
                WHERE id = p_order_id AND user_id = p_user_id AND status = 'pending';
                
                IF ROW_COUNT() = 0 THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Заказ не найден или не может быть оплачен';
                END IF;
                
                SET p_success = TRUE;
                COMMIT;
            END
        ");
        
        $this->pdo->exec("
            CREATE PROCEDURE IF NOT EXISTS sp_cancel_order(
                IN p_order_id INT,
                IN p_user_id INT,
                OUT p_success BOOLEAN
            )
            BEGIN
                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    ROLLBACK;
                    SET p_success = FALSE;
                END;
                
                START TRANSACTION;
                
                UPDATE orders 
                SET status = 'cancelled' 
                WHERE id = p_order_id AND user_id = p_user_id AND status = 'pending';
                
                IF ROW_COUNT() = 0 THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Заказ не найден или не может быть отменён';
                END IF;
                
                UPDATE machines m
                JOIN order_items oi ON m.id = oi.machine_id
                SET m.stock = m.stock + oi.quantity
                WHERE oi.order_id = p_order_id;
                
                SET p_success = TRUE;
                COMMIT;
            END
        ");
        
        $this->pdo->exec("
            CREATE TRIGGER IF NOT EXISTS trg_update_machine_stock
            AFTER INSERT ON order_items
            FOR EACH ROW
            BEGIN
                UPDATE machines SET stock = stock - NEW.quantity WHERE id = NEW.machine_id;
            END
        ");
        
        $this->pdo->exec("
            CREATE TRIGGER IF NOT EXISTS trg_check_price
            BEFORE INSERT ON machines
            FOR EACH ROW
            BEGIN
                IF NEW.price <= 0 THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price must be greater than 0';
                END IF;
            END
        ");
        
        $this->pdo->exec("
            CREATE TRIGGER IF NOT EXISTS trg_check_stock
            BEFORE INSERT ON order_items
            FOR EACH ROW
            BEGIN
                DECLARE available_stock INT;
                SELECT COALESCE(stock, 0) INTO available_stock FROM machines WHERE id = NEW.machine_id;
                IF available_stock < NEW.quantity THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough stock';
                END IF;
            END
        ");
        
        $check = $this->pdo->query("SELECT COUNT(*) FROM users WHERE username = 'admin'")->fetchColumn();
        if ($check == 0) {
            $hash = password_hash('password', PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("
                INSERT INTO users (username, email, name, password_hash, role) 
                VALUES ('admin', 'admin@example.com', 'Администратор', ?, 'admin')
            ");
            $stmt->execute([$hash]);
        }
        
        
        $checkMachines = $this->pdo->query("SELECT COUNT(*) FROM machines")->fetchColumn();
        if ($checkMachines == 0) {
            $stmt = $this->pdo->prepare("
                INSERT INTO machines (name, category, price, description, stock) 
                VALUES 
                ('Трактор Беларус-82.1', 'Тракторы', 3500000, 'Универсальный колёсный трактор', 5),
                ('Комбайн Дон-1500', 'Комбайны', 8500000, 'Зерноуборочный комбайн', 3),
                ('Плуг ПЛН-4-35', 'Плуги', 250000, 'Навесной плуг для вспашки почвы', 10),
                ('Сеялка C3-3.6', 'Сеялки', 1800000, 'Пневматическая сеялка точного высева', 4),
                ('Культиватор КПС-4', 'Культиваторы', 450000, 'Прицепной культиватор для сплошной обработки', 7)
            ");
            $stmt->execute();
        }
    }
}
?>