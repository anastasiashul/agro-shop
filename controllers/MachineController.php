<?php
class MachineController {
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public function getAll() {
        $machines = [
            ['id' => 1, 'name' => 'Трактор Беларус-82.1', 'category' => 'Тракторы', 'price' => 3500000, 'description' => 'Универсальный колёсный трактор', 'stock' => 5],
            ['id' => 2, 'name' => 'Комбайн Дон-1500', 'category' => 'Комбайны', 'price' => 8500000, 'description' => 'Зерноуборочный комбайн', 'stock' => 3],
            ['id' => 3, 'name' => 'Плуг ПЛН-4-35', 'category' => 'Плуги', 'price' => 250000, 'description' => 'Навесной плуг', 'stock' => 10],
        ];
        $this->sendResponse(['status' => 'success', 'data' => $machines]);
    }
}
?>