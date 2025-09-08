const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all news
router.get('/', async (req, res) => {
    try {
        const [news] = await db.query(`
            SELECT n.*, u.name as author_name
            FROM news n
            LEFT JOIN users u ON n.author_id = u.id
            ORDER BY n.created_at DESC
        `);
        res.json(news);
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ message: 'ไม่สามารถโหลดข้อมูลข่าวสารได้' });
    }
});

// Add new news
router.post('/', async (req, res) => {
    try {
        const { title, content, image_url, author_id } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const [result] = await db.query(
            'INSERT INTO news (title, content, image_url, author_id) VALUES (?, ?, ?, ?)',
            [title, content, image_url || null, author_id || null]
        );
        // ดึงข่าวที่เพิ่มใหม่กลับไปด้วย
        const [[newNews]] = await db.query(`
            SELECT n.*, u.name as author_name
            FROM news n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.id = ?
        `, [result.insertId]);
        res.status(201).json({ 
            id: result.insertId, 
            message: 'เพิ่มข่าวสารสำเร็จ',
            news: newNews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
