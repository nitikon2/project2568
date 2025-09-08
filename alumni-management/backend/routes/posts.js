const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// สร้างโฟลเดอร์สำหรับเก็บรูปภาพ
const uploadDir = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดการจัดการไฟล์
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ตั้งค่า multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // จำกัดขนาด 5MB
    },
    fileFilter: function(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, gif) เท่านั้น'));
    }
}).single('image');

// Get all posts with comments
router.get('/', async (req, res) => {
    try {
    const [posts] = await db.query(`
      SELECT p.*, u.name as author_name,
      COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// สร้างโพสต์ใหม่
router.post('/', (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                status: 'error',
                message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ' + err.message 
            });
        } else if (err) {
            return res.status(400).json({ 
                status: 'error',
                message: err.message 
            });
        }

        try {
            const { title, content, user_id } = req.body;

            // ตรวจสอบข้อมูลที่จำเป็น
            if (!title || !content || !user_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
                });
            }

            // เตรียม path สำหรับรูปภาพ
            let image_url = null;
            if (req.file) {
                image_url = `/static/posts/${req.file.filename}`;
            }

            // บันทึกข้อมูลลงฐานข้อมูล
            const [result] = await db.query(
                'INSERT INTO posts (title, content, user_id, image_url) VALUES (?, ?, ?, ?)',
                [title, content, user_id, image_url]
            );

            // ดึงข้อมูลโพสต์ที่สร้างใหม่
      const [posts] = await db.query(`
        SELECT p.*, u.name as author_name, 
             0 as comment_count 
        FROM posts p 
        LEFT JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?`,
        [result.insertId]
      );

            res.status(201).json({
                status: 'success',
                message: 'สร้างโพสต์สำเร็จ',
                post: posts[0]
            });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({
                status: 'error',
                message: 'เกิดข้อผิดพลาดในการสร้างโพสต์'
            });
        }
    });
});

// Get comments for a post
// Get comments for a post (nested replies)
router.get('/:postId/comments', async (req, res) => {
  try {
    const [comments] = await db.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.postId]);

    // Build nested structure
    const commentMap = {};
    comments.forEach(c => { commentMap[c.id] = { ...c, replies: [] }; });
    const rootComments = [];
    comments.forEach(c => {
      if (c.parent_comment_id) {
        if (commentMap[c.parent_comment_id]) {
          commentMap[c.parent_comment_id].replies.push(commentMap[c.id]);
        }
      } else {
        rootComments.push(commentMap[c.id]);
      }
    });
    res.json(rootComments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ 
      error: 'ไม่สามารถดึงข้อมูลความคิดเห็นได้',
      details: err.message 
    });
  }
});

// Add a comment
// Add a comment or reply
router.post('/:postId/comments', async (req, res) => {
  try {
    const { content, user_id, parent_comment_id } = req.body;
    const post_id = req.params.postId;

    // Validate input
    if (!content?.trim() || !user_id) {
      return res.status(400).json({ 
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // Check if post exists
    const [posts] = await db.query('SELECT id FROM posts WHERE id = ?', [post_id]);
    if (posts.length === 0) {
      return res.status(404).json({ 
        message: 'ไม่พบโพสต์ที่ต้องการแสดงความคิดเห็น'
      });
    }

    // Insert comment or reply
    const [result] = await db.query(
      'INSERT INTO comments (post_id, content, user_id, parent_comment_id) VALUES (?, ?, ?, ?)',
      [post_id, content, user_id, parent_comment_id || null]
    );

    // Get the inserted comment with author name
    const [comment] = await db.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    if (comment.length === 0) {
      throw new Error('ไม่สามารถบันทึกความคิดเห็นได้');
    }

    res.status(201).json(comment[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ 
      message: 'ไม่สามารถเพิ่มความคิดเห็นได้',
      error: err.message 
    });
  }
});


// แก้ไขโพสต์
router.put('/:id', (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }

    try {
      const postId = req.params.id;
      const { title, content } = req.body;

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!title || !content) {
        return res.status(400).json({
          status: 'error',
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
        });
      }

      // ตรวจสอบว่าโพสต์มีอยู่จริง
      const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
      if (posts.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'ไม่พบโพสต์ที่ต้องการแก้ไข'
        });
      }

      // เตรียม path สำหรับรูปภาพใหม่ (ถ้ามี) หรือกรณีลบรูป
      let image_url = posts[0].image_url;
      // กรณีอัปโหลดรูปใหม่
      if (req.file) {
        image_url = `/static/posts/${req.file.filename}`;
        // ลบไฟล์เก่าถ้ามี
        if (posts[0].image_url) {
          const oldPath = path.join(__dirname, '../uploads/posts', path.basename(posts[0].image_url));
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } else if (req.body.removeImage === 'true' || req.body.removeImage === true) {
        // กรณีลบรูป (removeImage = true)
        if (posts[0].image_url) {
          const oldPath = path.join(__dirname, '../uploads/posts', path.basename(posts[0].image_url));
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        image_url = null;
      }

      // อัปเดตข้อมูลโพสต์
      await db.query(
        'UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?',
        [title, content, image_url, postId]
      );

      // ดึงข้อมูลโพสต์ที่อัปเดต
      const [updated] = await db.query(
        'SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?',
        [postId]
      );

      res.json({
        status: 'success',
        message: 'แก้ไขโพสต์สำเร็จ',
        post: updated[0]
      });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({
        status: 'error',
        message: 'เกิดข้อผิดพลาดในการแก้ไขโพสต์'
      });
    }
  });
});


// ลบโพสต์
router.delete('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    // ตรวจสอบว่าโพสต์มีอยู่จริง
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบโพสต์ที่ต้องการลบ'
      });
    }

    // ลบไฟล์รูปภาพถ้ามี
    if (posts[0].image_url) {
      const imagePath = require('path').join(__dirname, '../uploads/posts', require('path').basename(posts[0].image_url));
      const fs = require('fs');
      if (fs.existsSync(imagePath)) {
        try { fs.unlinkSync(imagePath); } catch (e) { /* ignore */ }
      }
    }

    // ลบคอมเมนต์ที่เกี่ยวข้องกับโพสต์นี้
    await db.query('DELETE FROM comments WHERE post_id = ?', [postId]);
    // ลบโพสต์
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({
      status: 'success',
      message: 'ลบโพสต์สำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการลบโพสต์'
    });
  }
});

module.exports = router;
