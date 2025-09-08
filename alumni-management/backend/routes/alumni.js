const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/alumni - รายชื่อศิษย์เก่าทั้งหมด (ดึงจากตาราง users เฉพาะ role='user')
router.get('/', async (req, res) => {
    try {
        const [alumni] = await db.query(`
            SELECT 
                id, title, name, student_id, graduation_year, faculty, major, 
                occupation, position, workplace, salary, email, phone, current_address, created_at
            FROM users
            WHERE role = 'user'
            ORDER BY graduation_year DESC, created_at DESC
        `);

        // ดึงข้อมูลจากฟิลด์ที่ผู้ใช้กรอกตอนสมัคร (ถ้า null ให้เป็นค่าว่าง)
        const alumniWithDefaults = alumni.map(a => ({
            ...a,
            occupation: a.occupation || '',
            position: a.position || '',
            workplace: a.workplace || '',
            salary: a.salary || ''
        }));

        res.json(alumniWithDefaults);
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลศิษย์เก่า', error: err.message });
    }
});

// GET /api/alumni/:id - ข้อมูลศิษย์เก่ารายบุคคล (จาก users)
router.get('/:id', async (req, res) => {
    try {
        const [alumni] = await db.query(
            `SELECT 
                id, title, name, student_id, graduation_year, faculty, major, 
                occupation, position, workplace, salary, email, phone, current_address, created_at
             FROM users WHERE id = ? AND role = 'user'`,
            [req.params.id]
        );
        if (alumni.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลศิษย์เก่า' });
        }
        res.json(alumni[0]);
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลศิษย์เก่า', error: err.message });
    }
});

// POST /api/alumni - เพิ่มศิษย์เก่า (เพิ่มเข้า users)
router.post('/', async (req, res) => {
    try {
        const { title, name, student_id, graduation_year, faculty, major, occupation, position, workplace, salary, email, phone, current_address, password } = req.body;
        if (!title || !name || !student_id || !graduation_year || !faculty || !major || !email) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        // ตรวจสอบซ้ำ
        const [existing] = await db.query(
            'SELECT id FROM users WHERE student_id = ? OR email = ?',
            [student_id, email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'รหัสนักศึกษาหรืออีเมลนี้มีในระบบแล้ว' });
        }
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password || 'alumni123', 10);
        const [result] = await db.query(
            `INSERT INTO users (
                title, name, student_id, graduation_year, faculty, major, occupation, position, workplace, salary, email, phone, current_address, password, role, is_verified, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', true, NOW())`,
            [title, name, student_id, graduation_year, faculty, major, occupation || '', position || '', workplace || '', salary || '', email, phone || '', current_address || '', hashedPassword]
        );
        res.status(201).json({ id: result.insertId, message: 'เพิ่มข้อมูลศิษย์เก่าสำเร็จ' });
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลศิษย์เก่า', error: err.message });
    }
});

module.exports = router;

// ลบ DROP TABLE IF EXISTS alumni; ออกจาก schema.sql (ไม่ต้องมีตาราง alumni ในฐานข้อมูล)
// ใช้ตาราง users สำหรับข้อมูลศิษย์เก่า (role='user')
