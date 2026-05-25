CREATE DATABASE finance_app;

USE finance_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('income', 'expense'),
    amount DECIMAL(10,2),
    category_id INT,
    description TEXT,
    transaction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);