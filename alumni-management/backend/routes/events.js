const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all events
router.get('/', async (req, res) => {
    try {
                // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
                await db.query('SELECT 1');

                // Query พร้อมส่งจำนวนผู้เข้าร่วมกิจกรรม (participants_count)
                const [events] = await db.query(`
                        SELECT e.*, 
                                     (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS participants_count,
                                     CASE 
                                         WHEN e.event_date >= CURDATE() THEN 'upcoming'
                                         ELSE 'past'
                                     END as status
                        FROM events e
                        ORDER BY e.event_date DESC`
                );

                if (!events) {
                        throw new Error('ไม่สามารถดึงข้อมูลกิจกรรมได้');
                }

                res.json(events);
    } catch (err) {
        console.error('Database error in events route:', err);
        res.status(500).json({ 
            message: 'ไม่สามารถโหลดข้อมูลกิจกรรม',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get event by id
router.get('/:id', async (req, res) => {
    try {
        const [events] = await db.query(
            'SELECT * FROM events WHERE id = ?',
            [req.params.id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                message: 'ไม่พบข้อมูลกิจกรรมที่ต้องการ'
            });
        }

        res.json(events[0]);
    } catch (err) {
        console.error('Error getting event by id:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// User register for event
router.post('/:id/register', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const [existing] = await db.query(
            'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'คุณได้ลงทะเบียนกิจกรรมนี้แล้ว' });
        }
        await db.query(
            'INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)',
            [eventId, userId]
        );
        res.json({ message: 'ลงทะเบียนสำเร็จ' });
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: err.message });
    }
});

// User unregister (cancel registration) for event
router.delete('/:id/register', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const [existing] = await db.query(
            'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        if (existing.length === 0) {
            return res.status(400).json({ message: 'คุณยังไม่ได้ลงทะเบียนกิจกรรมนี้' });
        }
        await db.query(
            'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );
        res.json({ message: 'ยกเลิกการลงทะเบียนสำเร็จ' });
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยกเลิกลงทะเบียน', error: err.message });
    }
});

// Admin: get registrations for event
router.get('/:id/registrations', isAdmin, async (req, res) => {
    try {
        const eventId = req.params.id;
        const [registrations] = await db.query(`
            SELECT er.id, er.registered_at, u.id as user_id, u.name, u.email, u.faculty, u.graduation_year
            FROM event_registrations er
            JOIN users u ON er.user_id = u.id
            WHERE er.event_id = ?
            ORDER BY er.registered_at DESC
        `, [eventId]);
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ลงทะเบียน', error: err.message });
    }
});

module.exports = router;