-- ============================================
-- MediScan AI — Complete MySQL Schema
-- ============================================
-- Run this file to set up the database:
--   mysql -u root -p < schema.sql
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS mediscan_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mediscan_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'user'
                    COMMENT 'user or pharmacy',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 2. PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    raw_text        TEXT            NULL
                    COMMENT 'Full OCR extracted text',
    priority        VARCHAR(20)     NOT NULL DEFAULT 'regular'
                    COMMENT 'critical | high | urgent | regular',
    image_path      VARCHAR(500)    NULL
                    COMMENT 'Path to uploaded prescription image',
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending'
                    COMMENT 'pending | verified | ordered | completed',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_prescription_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    -- Indexes
    INDEX idx_prescription_priority (priority),
    INDEX idx_prescription_user (user_id),
    INDEX idx_prescription_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 3. MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id     INT             NOT NULL,
    medicine_name       VARCHAR(200)    NOT NULL,
    dosage              VARCHAR(100)    NULL,
    frequency           VARCHAR(100)    NULL,
    duration            VARCHAR(100)    NULL,

    -- Foreign Keys
    CONSTRAINT fk_medicine_prescription
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
        ON DELETE CASCADE,

    -- Indexes
    INDEX idx_medicine_prescription (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id     INT             NOT NULL,
    user_id             INT             NOT NULL,
    order_status        VARCHAR(20)     NOT NULL DEFAULT 'pending'
                        COMMENT 'pending | processing | completed',
    delivery_address    TEXT            NULL,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_order_prescription
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    -- Indexes
    INDEX idx_order_user (user_id),
    INDEX idx_order_status (order_status),
    INDEX idx_order_prescription (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- RELATIONSHIPS SUMMARY
-- ============================================
-- users (1) ──→ (many) prescriptions
-- users (1) ──→ (many) orders
-- prescriptions (1) ──→ (many) medicines
-- prescriptions (1) ──→ (many) orders
-- All foreign keys have ON DELETE CASCADE
-- ============================================
