const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'ไม่พบ token การยืนยันตัวตน' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'รูปแบบ token ไม่ถูกต้อง' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'token หมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
    return res.status(401).json({ message: 'token ไม่ถูกต้อง' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'การยืนยันตัวตนล้มเหลว' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
