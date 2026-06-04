<?php
class User {
    private $users = [];
    
    public function __construct() {
        $this->users = [
            ['id' => 1, 'username' => 'admin', 'email' => 'admin@example.com', 'name' => 'Admin', 'password_hash' => password_hash('password', PASSWORD_DEFAULT), 'role' => 'admin']
        ];
    }
    
    public function findByUsername($username) {
        foreach ($this->users as $user) {
            if ($user['username'] === $username) {
                return ['id' => $user['id'], 'user' => $user];
            }
        }
        return null;
    }
    
    public function create($username, $email, $name, $passwordHash) {
        foreach ($this->users as $user) {
            if ($user['username'] === $username) {
                return ['error' => 'Username already exists'];
            }
            if ($user['email'] === $email) {
                return ['error' => 'Email already exists'];
            }
        }
        
        $newId = count($this->users) + 1;
        $newUser = [
            'id' => $newId,
            'username' => $username,
            'email' => $email,
            'name' => $name,
            'password_hash' => $passwordHash,
            'role' => 'user'
        ];
        $this->users[] = $newUser;
        return ['success' => true, 'id' => $newId];
    }
}
?>