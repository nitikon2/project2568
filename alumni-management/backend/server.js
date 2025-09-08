const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();

// สร้างโฟลเดอร์ที่จำเป็นทั้งหมด
const dirs = ['uploads', 'uploads/posts', 'uploads/profiles', 'uploads/news', 'uploads/events'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ 
    limit: '50mb', 
    extended: true,
    parameterLimit: 50000 
}));

// กำหนดการเข้าถึงไฟล์สถิต
app.use('/static', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const alumniRoutes = require('./routes/alumni');
const usersRoutes = require('./routes/users');
const newsRoutes = require('./routes/news');
const postsRoutes = require('./routes/posts');
const eventsRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Routes
app.use('/api/alumni', alumniRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Error handling for file uploads
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 5MB)' });
        }
    }
    next(err);
});

// เพิ่ม comment: ตรวจสอบเส้นทาง API ว่าตรงกับ frontend เรียกหรือไม่
// ตัวอย่าง: ถ้า frontend เรียก /api/users/123/profile-image
// ต้องมี route ใน users.js: router.post('/:id/profile-image', ...)
// และใน server.js ต้องมี app.use('/api/users', usersRoutes);

// Error handling สำหรับ route ที่ไม่มีอยู่ (ต้องอยู่หลังทุก app.use route)
app.use((req, res, next) => {
    res.status(404).json({ message: 'ไม่พบ API endpoint ที่ร้องขอ' });
});

// ปรับปรุง global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // ถ้าเป็น error ที่เกิดจาก multer
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            message: err.code === 'LIMIT_FILE_SIZE' 
                ? 'ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 5MB)'
                : 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์'
        });
    }

    res.status(err.status || 500).json({ 
        message: err.message || 'เกิดข้อผิดพลาดในการทำงานของเซิร์ฟเวอร์',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
