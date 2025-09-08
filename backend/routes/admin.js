const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware เพื่อตรวจสอบสิทธิ์การเข้าถึง
const isAdmin = (req, res, next) => {
    // สมมติว่าคุณมีข้อมูล user ใน req.user
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้' });
    }
};

// ใช้ middleware isAdmin
router.use(isAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [usersCount] = await db.query('SELECT COUNT(*) as total FROM users');
        const [newsCount] = await db.query('SELECT COUNT(*) as total FROM news');
        const [eventsCount] = await db.query('SELECT COUNT(*) as total FROM events');
        const [alumniCount] = await db.query('SELECT COUNT(*) as total FROM alumni');

        res.json({
            totalUsers: usersCount[0].total,
            totalNews: newsCount[0].total,
            totalEvents: eventsCount[0].total,
            totalAlumni: alumniCount[0].total
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
    }
});

module.exports = router;
