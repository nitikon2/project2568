const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAdmin } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.use(isAdmin);

// Ensure upload directories exist
const newsUploadDir = path.join(__dirname, '..', 'uploads', 'news');
const eventsUploadDir = path.join(__dirname, '..', 'uploads', 'events');
if (!fs.existsSync(newsUploadDir)) fs.mkdirSync(newsUploadDir, { recursive: true });
if (!fs.existsSync(eventsUploadDir)) fs.mkdirSync(eventsUploadDir, { recursive: true });

// ตั้งค่าการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, newsUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, ''));
  }
});
const upload = multer({ storage });

// ตั้งค่าการอัปโหลดไฟล์กิจกรรม
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, eventsUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, ''));
  }
});
const eventUpload = multer({ storage: eventStorage });

// Get users statistics
router.get('/users', async (req, res) => {
    try {
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM users');
        const [recent] = await db.query(
            'SELECT id, name, faculty, graduation_year, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );
        
        res.json({ total, recent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get posts statistics
router.get('/posts', async (req, res) => {
    try {
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM posts');
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get posts statistics
router.get('/posts/stats', async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM posts');
    const [[{ today }]] = await db.query(
      'SELECT COUNT(*) as today FROM posts WHERE DATE(created_at) = CURDATE()'
    );
    const [[{ pending }]] = await db.query(
      'SELECT COUNT(*) as pending FROM posts WHERE status = "pending"'
    );
    
    res.json({ total, today, pending });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

// Get all posts with details
router.get('/posts/all', async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.name as author_name, 
             COUNT(DISTINCT c.id) as comment_count,
             COALESCE(p.status, 'pending') as status
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// Approve/Reject post
router.put('/posts/:id/:status', async (req, res) => {
  let connection;
  try {
    const { id, status } = req.params;
    
    if (!['approve', 'reject'].includes(status)) {
      return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if post exists
    const [posts] = await connection.query(
      'SELECT id, status FROM posts WHERE id = ? FOR UPDATE',
      [id]
    );

    if (posts.length === 0) {
      throw new Error('ไม่พบโพสต์ที่ต้องการอัพเดท');
    }

    if (posts[0].status !== 'pending') {
      throw new Error('ไม่สามารถเปลี่ยนแปลงสถานะของโพสต์นี้ได้');
    }

    // Update post status
    const newStatus = status === 'approve' ? 'approved' : 'rejected';
    await connection.query(
      'UPDATE posts SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    await connection.commit();
    res.json({ message: `${status === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}โพสต์เรียบร้อย` });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating post status:', err);
    res.status(err.message.includes('ไม่พบโพสต์') ? 404 : 500)
       .json({ message: err.message || 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    // ลบ comment ที่เกี่ยวข้องกับโพสต์ก่อน (ถ้ามี)
    await db.query('DELETE FROM comments WHERE post_id = ?', [req.params.id]);
    // ลบโพสต์
    const [result] = await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบโพสต์นี้' });
    }
    res.json({ message: 'ลบโพสต์เรียบร้อย' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบโพสต์', error: err.message });
  }
});

// Get events statistics
router.get('/events', async (req, res) => {
    try {
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM events');
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get events statistics
router.get('/events/stats', async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM events');
    const [[{ upcoming }]] = await db.query(
      'SELECT COUNT(*) as upcoming FROM events WHERE event_date >= CURDATE()'
    );
    const [[{ past }]] = await db.query(
      'SELECT COUNT(*) as past FROM events WHERE event_date < CURDATE()'
    );
    
    res.json({ total, upcoming, past });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

// Get all events for admin
router.get('/events', async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT *, 
        CASE 
          WHEN event_date >= CURDATE() THEN 'upcoming'
          ELSE 'past'
        END as status
      FROM events 
      ORDER BY event_date DESC
    `);

    res.json(events); // ส่ง array โดยตรง ไม่ต้องครอบด้วย object
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'ไม่สามารถดึงข้อมูลได้'
    });
  }
});

// Add new event
router.post('/events', isAdmin, eventUpload.single('image'), async (req, res) => {
  try {
    const { title, description, event_date, location } = req.body;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/events/${req.file.filename}`;
    }

    if (!title || !description || !event_date || !location) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const [result] = await db.query(`
      INSERT INTO events (title, description, event_date, location, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [title, description, event_date, location, image_url]);

    res.status(201).json({
      status: 'success',
      message: 'เพิ่มกิจกรรมสำเร็จ',
      id: result.insertId
    });

  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).json({
      status: 'error',
      message: 'ไม่สามารถเพิ่มข้อมูลได้'
    });
  }
});

// Update event (รองรับ multipart/form-data)
router.put('/events/:id', isAdmin, eventUpload.single('image'), async (req, res) => {
  try {
    const { title, description, event_date, location } = req.body;
    const eventId = req.params.id;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/events/${req.file.filename}`;
    }

    if (!title || !description || !event_date || !location) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    let updateSql = `
      UPDATE events 
      SET title = ?, description = ?, event_date = ?, location = ?
    `;
    const params = [title, description, event_date, location];

    if (image_url) {
      updateSql += `, image_url = ?`;
      params.push(image_url);
    }
    updateSql += ` WHERE id = ?`;
    params.push(eventId);

    await db.query(updateSql, params);

    res.json({ 
      status: 'success',
      message: 'อัพเดทข้อมูลสำเร็จ' 
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'ไม่สามารถอัพเดทข้อมูลได้' 
    });
  }
});

// Delete event
router.delete('/events/:id', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ 
      status: 'success',
      message: 'ลบข้อมูลสำเร็จ' 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'ไม่สามารถลบข้อมูลได้' 
    });
  }
});

// Get alumni statistics
router.get('/alumni/stats', async (req, res) => {
  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role = ?',
      ['user']
    );
    
    const [[{ verified }]] = await db.query(
      'SELECT COUNT(*) as verified FROM users WHERE role = ? AND is_verified = true',
      ['user']
    );
    
    const pending = total - verified;
    
    res.json({ total, verified, pending });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

// Get all alumni
router.get('/alumni', isAdmin, async (req, res) => {
  try {
    const [alumni] = await db.query(`
      SELECT id, student_id, title, name, faculty, major, graduation_year, email, phone,
             occupation, position, workplace, salary, bio, current_address, profile_image,
             province, district, subdistrict, zipcode, created_at
      FROM users WHERE role = 'user'
      ORDER BY created_at DESC
    `);
    res.json({
      status: 'success',
      alumni: alumni
    });
  } catch (err) {
    console.error('Error fetching alumni:', err);
    res.status(500).json({
      status: 'error',
      message: 'ไม่สามารถดึงข้อมูลได้'
    });
  }
});

// Add new alumni
router.post('/alumni', isAdmin, async (req, res) => {
  try {
    const {
      student_id,
      title = '',
      name,
      faculty,
      major,
      graduation_year,
      email,
      phone = '',
      occupation = '',
      position = '',
      workplace = '',
      salary = '',
      bio = '',
      current_address = '',
      profile_image = '',
      province = '',
      district = '',
      subdistrict = '',
      zipcode = '',
      password = "alumni123"
    } = req.body;

    if (!student_id || !name || !faculty || !major || !graduation_year || !email) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE student_id = ? OR email = ?',
      [student_id, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'รหัสนักศึกษาหรืออีเมลนี้มีในระบบแล้ว'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(`
      INSERT INTO users (
        student_id, title, name, password, email, phone, faculty, major, graduation_year,
        occupation, position, workplace, salary, bio, current_address, profile_image,
        province, district, subdistrict, zipcode,
        role, is_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', true, NOW())
    `, [
      student_id, title, name, hashedPassword, email, phone, faculty, major, graduation_year,
      occupation, position, workplace, salary, bio, current_address, profile_image,
      province, district, subdistrict, zipcode
    ]);

    res.status(201).json({
      status: 'success',
      message: 'เพิ่มข้อมูลสำเร็จ',
      id: result.insertId
    });

  } catch (err) {
    console.error('Error adding alumni:', err);
    res.status(500).json({
      status: 'error',
      message: 'ไม่สามารถเพิ่มข้อมูลได้',
      error: err.message
    });
  }
});

// Update alumni
router.put('/alumni/:id', isAdmin, async (req, res) => {
  try {
    const {
      student_id,
      title = '',
      name,
      faculty,
      major,
      graduation_year,
      email,
      phone = '',
      occupation = '',
      position = '',
      workplace = '',
      salary = '',
      bio = '',
      current_address = '',
      profile_image = '',
      province = '',
      district = '',
      subdistrict = '',
      zipcode = ''
    } = req.body;
    const userId = req.params.id;

    const [existing] = await db.query(
      'SELECT id FROM users WHERE (student_id = ? OR email = ?) AND id != ?',
      [student_id, email, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'รหัสนักศึกษาหรืออีเมลนี้มีในระบบแล้ว'
      });
    }

    await db.query(`
      UPDATE users 
      SET student_id = ?, title = ?, name = ?, faculty = ?, major = ?, graduation_year = ?, email = ?, phone = ?,
          occupation = ?, position = ?, workplace = ?, salary = ?, bio = ?, current_address = ?, profile_image = ?,
          province = ?, district = ?, subdistrict = ?, zipcode = ?
      WHERE id = ? AND role = 'user'`,
      [student_id, title, name, faculty, major, graduation_year, email, phone, occupation, position, workplace, salary, bio, current_address, profile_image, province, district, subdistrict, zipcode, userId]
    );

    res.json({ message: 'อัพเดทข้อมูลสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถอัพเดทข้อมูลได้' });
  }
});

// Delete alumni
router.delete('/alumni/:id', isAdmin, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM users WHERE id = ? AND role = "user"',
      [req.params.id]
    );
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถลบข้อมูลได้' });
  }
});

// Get all forum posts
router.get('/forum/posts', async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.name as author_name, 
             COUNT(c.id) as comment_count,
             COALESCE(p.status, 'pending') as status
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// Update post status
router.put('/forum/posts/:id/:status', async (req, res) => {
  try {
    const { id, status } = req.params;
    const newStatus = status === 'approved' ? 'approved' : 'rejected';
    await db.query(
      'UPDATE posts SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );
    res.json({ message: `${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}โพสต์เรียบร้อย` });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' });
  }
});

// Delete post
router.delete('/forum/posts/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'ลบโพสต์เรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบโพสต์' });
  }
});

// Delete a single comment by ID
router.delete('/forum/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    // ลบทั้งคอมเมนต์หลักและ reply ที่เกี่ยวข้อง
    const [result] = await db.query('DELETE FROM comments WHERE id = ? OR parent_comment_id = ?', [commentId, commentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบคอมเมนต์นี้' });
    }
    res.json({ message: 'ลบคอมเมนต์และตอบกลับเรียบร้อย' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบคอมเมนต์', error: err.message });
  }
});

// Get all news
router.get('/news', isAdmin, async (req, res) => {
  try {
    if (req.query.stats === '1') {
      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM news');
      return res.json({ total });
    }
    // ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
    await db.query('SELECT 1');
    const [news] = await db.query(`
      SELECT n.*, u.name as author_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      ORDER BY n.created_at DESC
    `);
    // ถ้าไม่มีข่าว ให้ส่ง array ว่าง
    if (!news || !Array.isArray(news)) {
      return res.json([]);
    }
    res.json(news);
  } catch (err) {
    console.error('Error in GET /admin/news:', err);
    res.status(500).json({ 
      message: 'ไม่สามารถโหลดข้อมูลข่าวสารได้',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Add news (รองรับ multipart/form-data)
router.post('/news', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const author_id = req.user?.id;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/news/${req.file.filename}`;
    }

    if (!title || !content) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    const [result] = await db.query(`
      INSERT INTO news (title, content, image_url, author_id)
      VALUES (?, ?, ?, ?)
    `, [title, content, image_url, author_id]);

    const [[newNews]] = await db.query(`
      SELECT n.*, u.name as author_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `, [result.insertId]);

    res.status(201).json({
      status: 'success',
      message: 'เพิ่มข่าวสารสำเร็จ',
      news: newNews
    });
  } catch (err) {
    console.error('Error adding news:', err);
    res.status(500).json({ message: 'ไม่สามารถเพิ่มข่าวสารได้' });
  }
});

// Update news (รองรับ multipart/form-data)
router.put('/news/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const newsId = req.params.id;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/news/${req.file.filename}`;
    }

    if (!title || !content) {
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    let updateSql = `
      UPDATE news 
      SET title = ?, content = ?
    `;
    const params = [title, content];

    if (image_url) {
      updateSql += `, image_url = ?`;
      params.push(image_url);
    }
    updateSql += ` WHERE id = ?`;
    params.push(newsId);

    await db.query(updateSql, params);

    res.json({ message: 'อัพเดทข่าวสารสำเร็จ' });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ message: 'ไม่สามารถอัพเดทข่าวสารได้' });
  }
});

// Delete news
router.delete('/news/:id', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ message: 'ลบข่าวสารสำเร็จ' });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ message: 'ไม่สามารถลบข่าวสารได้' });
  }
});

// Get all events with registrations for admin
router.get('/events-with-registrations', async (req, res) => {
  try {
    // ดึงกิจกรรมทั้งหมด
    const [events] = await db.query(`
      SELECT *, 
        CASE 
          WHEN event_date >= CURDATE() THEN 'upcoming'
          ELSE 'past'
        END as status
      FROM events 
      ORDER BY event_date DESC
    `);

    // ดึงผู้ลงทะเบียนของแต่ละกิจกรรม
    const eventIds = events.map(e => e.id);
    let registrations = [];
    if (eventIds.length > 0) {
      const [regs] = await db.query(`
        SELECT er.id, er.event_id, er.registered_at, u.id as user_id, u.name, u.email, u.faculty, u.graduation_year
        FROM event_registrations er
        JOIN users u ON er.user_id = u.id
        WHERE er.event_id IN (?)
        ORDER BY er.event_id, er.registered_at DESC
      `, [eventIds]);
      registrations = regs;
    }

    // รวมข้อมูล
    const eventsWithRegs = events.map(event => ({
      ...event,
      registrations: registrations.filter(r => r.event_id === event.id)
    }));

    res.json(eventsWithRegs);
  } catch (err) {
    console.error('Error fetching events with registrations:', err);
    res.status(500).json({ message: 'ไม่สามารถโหลดข้อมูลกิจกรรมและผู้ลงทะเบียนได้' });
  }
});

module.exports = router;