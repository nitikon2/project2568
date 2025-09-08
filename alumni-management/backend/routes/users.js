const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
}).single('profile_image');

// Login route
// Search alumni
router.get('/search', async (req, res) => {
    try {
        const { name, student_id, faculty, email } = req.query;
        let sql = 'SELECT id, name, student_id, faculty, email, title, grad_year FROM users WHERE 1=1';
        const params = [];
        if (name) {
            sql += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }
        if (student_id) {
            sql += ' AND student_id LIKE ?';
            params.push(`%${student_id}%`);
        }
        if (faculty) {
            sql += ' AND faculty LIKE ?';
            params.push(`%${faculty}%`);
        }
        if (email) {
            sql += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }
        sql += ' ORDER BY name ASC LIMIT 100';
        const [users] = await db.query(sql, params);
        res.json(users);
    } catch (err) {
        console.error('Search alumni error:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหา' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });

        const [users] = await db.query(
            `SELECT * FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = users[0];

        // ตรวจสอบรหัสผ่าน: ถ้า hash ตรงหรือ plain text ตรง (รองรับทั้งสองแบบ)
        let isValidPassword = false;
        if (await bcrypt.compare(password, user.password)) {
            isValidPassword = true;
        } else if (user.password === password) {
            isValidPassword = true;
        }

        if (!isValidPassword) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const tokenData = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            title: user.title,
            faculty: user.faculty,
            student_id: user.student_id
        };

        const token = jwt.sign(
            tokenData,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const { password: _, ...userData } = user;
        res.json({
            user: userData,
            token
        });

    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
    const { password, province, district, subdistrict, zipcode, ...userData } = req.body;
        
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!userData.title || !userData.name || !password || !userData.student_id || !userData.email || !userData.phone || !userData.graduation_year || !userData.faculty || !userData.major) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
            });
        }

        // ตรวจสอบ email ซ้ำ
        const [emailUser] = await db.query('SELECT id FROM users WHERE email = ?', [userData.email]);
        if (emailUser.length > 0) {
            return res.status(400).json({
                message: 'อีเมลนี้มีในระบบแล้ว'
            });
        }

        // ตรวจสอบ student_id ซ้ำ
        const [studentUser] = await db.query('SELECT id FROM users WHERE student_id = ?', [userData.student_id]);
        if (studentUser.length > 0) {
            return res.status(400).json({
                message: 'รหัสนักศึกษานี้มีในระบบแล้ว'
            });
        }

        // เข้ารหัสรหัสผ่าน (ต้องทำแค่ครั้งเดียว)
        const hashedPassword = await require('bcryptjs').hash(password, 10);

        // เพิ่มข้อมูลผู้ใช้
        const [result] = await db.query(
            `INSERT INTO users (
                title, name, password, student_id,
                email, phone, graduation_year,
                faculty, major, occupation, position, workplace, salary, bio,
                current_address, role, is_verified,
                province, district, subdistrict, zipcode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', false, ?, ?, ?, ?)`,
            [
                userData.title, userData.name, hashedPassword, userData.student_id,
                userData.email, userData.phone, userData.graduation_year,
                userData.faculty, userData.major, userData.occupation || '',
                userData.position || '', userData.workplace || '', userData.salary || '', userData.bio || '',
                userData.current_address || '',
                province || '', district || '', subdistrict || '', zipcode || ''
            ]
        );

        res.status(201).json({
            message: 'ลงทะเบียนสำเร็จ',
            userId: result.insertId
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการลงทะเบียน'
        });
    }
});

// Get user by ID route
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, email, 
                    IFNULL(phone, '') as phone, 
                    IFNULL(graduation_year, '') as graduation_year, 
                    IFNULL(faculty, '') as faculty, 
                    IFNULL(major, '') as major, 
                    IFNULL(occupation, '') as occupation, 
                    IFNULL(position, '') as position,
                    IFNULL(workplace, '') as workplace,
                    IFNULL(salary, '') as salary,
                    IFNULL(bio, '') as bio,
                    IFNULL(profile_image, '') as profile_image,
                    IFNULL(province, '') as province,
                    IFNULL(district, '') as district,
                    IFNULL(subdistrict, '') as subdistrict,
                    IFNULL(zipcode, '') as zipcode,
                    created_at 
             FROM users WHERE id = ?`,
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }

        const user = users[0];
        res.json(user);
    } catch (err) {
        res.status(500).json({ 
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
            error: err.message 
        });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
        const { 
            name,
            phone,
            graduation_year,
            faculty,
            major,
            occupation,
            position,
            workplace,
            salary,
            bio,
            province,
            district,
            subdistrict,
            zipcode
        } = req.body;

    // Validate required fields
    if (!name || !phone || !graduation_year || !faculty || !major) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

        await db.query(
            `UPDATE users 
             SET name = ?, phone = ?, graduation_year = ?, 
                     faculty = ?, major = ?, occupation = ?, position = ?, workplace = ?, salary = ?, bio = ?,
                     province = ?, district = ?, subdistrict = ?, zipcode = ?,
                     updated_at = NOW()
             WHERE id = ?`,
            [
                name,
                phone,
                graduation_year,
                faculty,
                major,
                occupation ?? '',
                position ?? '',
                workplace ?? '',
                salary ?? '',
                bio ?? '',
                province ?? '',
                district ?? '',
                subdistrict ?? '',
                zipcode ?? '',
                req.params.id
            ]
        );

        const [users] = await db.query(
            `SELECT id, name, email, phone, graduation_year, faculty, 
                            major, occupation, position, workplace, salary, bio,
                            province, district, subdistrict, zipcode
             FROM users WHERE id = ?`, 
            [req.params.id]
        );

    if (users.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    res.json({
      status: 'success',
      message: 'อัพเดทข้อมูลสำเร็จ',
      user: users[0]
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'ไม่สามารถอัพเดทข้อมูลผู้ใช้ได้',
      error: err && err.message ? err.message : err
    });
  }
});

// Get events that user registered
router.get('/:id/event-registrations', verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const [rows] = await db.query(
            'SELECT event_id FROM event_registrations WHERE user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรมที่ลงทะเบียน', error: err.message });
    }
});

// เพิ่ม route สำหรับอัปโหลดรูปโปรไฟล์
router.post('/:id/profile-image', verifyToken, (req, res) => {
    if (req.user.id != req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'ไม่มีสิทธิ์เปลี่ยนรูปโปรไฟล์' });
    }
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 5MB)' });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาเลือกรูปภาพ' });
        }
        try {
            const imagePath = `/uploads/profiles/${req.file.filename}`;
            await db.query(
                'UPDATE users SET profile_image = ? WHERE id = ?',
                [imagePath, req.params.id]
            );
            res.json({ profile_image: imagePath });
        } catch (error) {
            res.status(500).json({ message: 'ไม่สามารถอัปโหลดรูปโปรไฟล์ได้' });
        }
    });
});

// POST /api/users/forgot-password - ขอรหัส OTP (ไม่ส่งอีเมล, โชว์ OTP ใน response)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'กรุณากรอกอีเมล' });

        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }

                // สร้างรหัส OTP 6 หลัก
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                await db.query('UPDATE users SET reset_code = ? WHERE email = ?', [otp, email]);

                // ส่ง OTP ทางอีเมลจริง
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'your_gmail@gmail.com', // เปลี่ยนเป็นอีเมลของคุณ
                        pass: 'your_app_password' // ใช้ App Password จาก Gmail
                    }
                });

                await transporter.sendMail({
                    from: 'Alumni System <your_gmail@gmail.com>',
                    to: email,
                    subject: 'รหัสรีเซ็ตรหัสผ่าน',
                    text: `รหัสรีเซ็ตสำหรับรีเซ็ตรหัสผ่านของคุณคือ: ${otp}`
                });

                res.json({ message: 'ส่งรหัสรีเซ็ตไปยังอีเมลแล้ว' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการขอ OTP', error: err.message });
    }
});

// POST /api/users/reset-password - รีเซ็ตรหัสผ่าน
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
        }
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }
        const hashedPassword = await require('bcryptjs').hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
        res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
    } catch (err) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
    }
});

module.exports = router;