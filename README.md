# АгроМаркет

Веб-приложение для управления каталогом сельскохозяйственной техники, корзиной, заказами и пользователями.

## Функциональные возможности

- Регистрация и аутентификация пользователей (токен с 24-часовым сроком действия)
- Просмотр каталога техники
- Корзина с проверкой остатков при оформлении заказа
- Оформление, оплата и отмена заказов
- Админ-панель:
  - Управление техникой (CRUD)
  - Управление пользователями (создание, просмотр)
  - Просмотр всех заказов с фильтрацией по пользователю и статусу
  - Статистика по технике и пользователям
- Логирование всех действий

## Технологический стек

- Backend: PHP 7.4+, MySQL
- Frontend: HTML, CSS, JavaScript (vanilla)
- Библиотеки: Respect\Validation для валидации

## Установка и запуск

Требования:
- XAMPP или OpenServer (Apache + PHP + MySQL)
- Composer

Инструкция:

1. Скопируйте папку проекта в директорию htdocs (XAMPP) или domains (OpenServer)

2. Запустите Apache и MySQL в панели управления

3. Установите зависимости Composer в папке проекта:
   cd agro-shop
   composer install

4. Откройте в браузере: http://localhost/agro-shop/client/index.html

5. База данных создастся автоматически при первом обращении к API

Тестовый вход:
- Логин: admin
- Пароль: password

## Структура проекта

agro-shop/

  api/            эндпоинты (index.php, routes.php)
  
  controllers/    обработка запросов
  
  core/           ядро (БД, роутер, логгер, процедуры)
  
  models/         работа с БД
  
  services/       бизнес-логика
  
  client/         фронтенд (HTML, CSS, JS)
  
  client/js/admin/     модули админ-панели
    
  logs/           логи (создаётся автоматически)
  
  vendor/         Composer зависимости

## API Эндпоинты

POST /api/register - Регистрация

POST /api/login - Вход

GET /api/machines - Список техники

GET /api/machines/%d - Карточка техники

POST /api/machines - Создание техники (admin)

PUT /api/machines/%d - Обновление техники (admin)

DELETE /api/machines/%d - Удаление техники (admin)

GET /api/cart - Получить корзину

POST /api/cart - Сохранить корзину

POST /api/orders - Создание заказа

POST /api/orders/%d/pay - Оплата заказа

DELETE /api/orders/%d - Отмена заказа

GET /api/orders - Мои заказы

GET /api/orders/all - Все заказы (admin)

GET /api/users - Список пользователей (admin)

GET /api/users/%d - Детали пользователя (admin)

POST /api/users - Создание пользователя (admin)

GET /api/stats/machines - Статистика по технике (admin)

GET /api/stats/users - Статистика по пользователям (admin)

POST /api/logout - Выход

## Логирование

Логи хранятся в файле logs/app.log. Логируются следующие события:

- Регистрация нового пользователя
- Успешный и неудачный вход
- Выход из системы
- Создание, обновление и удаление техники
- Создание, оплата и отмена заказов
- Создание пользователей администратором

## База данных

При первом запуске автоматически создаются:

- 5 таблиц (users, machines, orders, order_items, carts)
- 3 представления (v_machines_stats, v_user_orders_stats, v_orders_details)
- 3 функции (fn_user_orders_count, fn_user_total_spent, fn_machine_stock)
- 3 хранимые процедуры (sp_create_order, sp_pay_order, sp_cancel_order)
- 3 триггера (trg_update_machine_stock, trg_check_price, trg_check_stock)
