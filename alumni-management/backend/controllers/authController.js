const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../db');

// Store OTPs in memory for demo (should use Redis or DB in production)
const otpStore = {};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'กรุณาระบุอีเมล' });

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    if (results.length === 0) return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10 min

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน',
      text: `รหัส OTP ของคุณคือ: ${otp}`,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('OTP email sent:', info.response);
      res.json({ message: 'ส่ง OTP สำเร็จ' });
    } catch (e) {
      console.error('Send OTP email error:', e);
      res.status(500).json({ message: 'ส่งอีเมลไม่สำเร็จ', error: e.message });
    }
  });
};

exports.verifyOtp = (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ message: 'OTP ไม่ถูกต้องหรือหมดอายุ' });
  }
  // Update password
  db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email], (err, result) => {
    if (err) return res.status(500).json({ message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
    delete otpStore[email];
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  });
};
