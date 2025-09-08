CREATE DATABASE IF NOT EXISTS alumni_db;
USE alumni_db;

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS event_registrations;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(20) NOT NULL,                    -- คำนำหน้า
            name VARCHAR(100) NOT NULL,                    -- ชื่อ-นามสกุล
            first_name VARCHAR(50) NULL,
            last_name VARCHAR(50) NULL,
    password VARCHAR(255) NOT NULL,                -- รหัสผ่าน
    student_id VARCHAR(12) NOT NULL UNIQUE,        -- รหัสนักศึกษา
    email VARCHAR(100) NOT NULL UNIQUE,            -- อีเมล
    phone VARCHAR(10),                             -- เบอร์โทร
    graduation_year INT NOT NULL,                  -- ปีการศึกษาที่จบ
    faculty VARCHAR(100) NOT NULL,                 -- คณะ
    major VARCHAR(100) NOT NULL,                   -- สาขาวิชาที่จบ
    occupation VARCHAR(100),                       -- ตำแหน่งงานปัจจุบัน
    bio TEXT NULL,                                 -- เพิ่ม bio ตรงนี้
    position VARCHAR(100) NULL,
    workplace VARCHAR(255) NULL,
    salary VARCHAR(50) NULL,
    current_address TEXT,                          -- ที่อยู่ปัจจุบัน
    is_verified BOOLEAN DEFAULT false,             -- เพิ่ม column สำหรับการยืนยันตัวตน
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    profile_image VARCHAR(255) NULL,
    reset_code VARCHAR(10) NULL
    , province VARCHAR(100) NULL
    , district VARCHAR(100) NULL
    , subdistrict VARCHAR(100) NULL
    , zipcode VARCHAR(10) NULL
);
    -- เพิ่ม column first_name และ last_name ถ้ายังไม่มีในฐานข้อมูลจริง
    -- ALTER TABLE users ADD COLUMN first_name VARCHAR(50) NULL, ADD COLUMN last_name VARCHAR(50) NULL;

    -- แยกชื่อและนามสกุลจาก name ไปยัง first_name และ last_name
    -- first_name = คำแรก, last_name = คำสุดท้าย
    UPDATE users
    SET
        first_name = SUBSTRING_INDEX(name, ' ', 1),
        last_name = TRIM(SUBSTRING_INDEX(name, ' ', -1));

-- ปรับปรุงตาราง news
DROP TABLE IF EXISTS news;
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    user_id INT NOT NULL,
    status ENUM('pending', 'active', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    content TEXT NOT NULL,
    user_id INT,
    parent_comment_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_user (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ลบข้อมูล admin เดิม (ถ้ามี)
DELETE FROM users WHERE role = 'admin';

-- เพิ่มข้อมูล admin ใหม่
INSERT INTO users (
    title,
    name,
    password,
    student_id,
    email,
    phone,
    graduation_year,
    faculty,
    major,
    occupation,
    position,
    workplace,
    salary,
    current_address,
    role,
    is_verified
) VALUES (
    'นาย',
    'ผู้ดูแล ระบบ',
    '$2a$10$S3YxmEcxZBPVVW0nNI7QHuGsV2iJ4nFDQjEBQqVBp40UR6OIHFnGy', -- admin123456
    'admin',
    'admin@rmu.ac.th',
    '0812345678',
    2566,
    'คณะเทคโนโลยีสารสนเทศ',
    'เทคโนโลยีสารสนเทศ',
    NULL, NULL, NULL, NULL, NULL,
    'admin',
    true
);