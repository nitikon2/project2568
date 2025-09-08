const db = require('../db');  // แก้ไขการ import จาก config/database เป็น db

const Event = {
  getAll: async () => {
    const [events] = await db.query(
      'SELECT * FROM events ORDER BY event_date DESC'
    );
    return events;
  },

  getById: async (id) => {
    const [event] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );
    return event[0];
  },

  create: async (eventData) => {
    const [result] = await db.query(
      // ตรวจสอบว่ามี column event_time, organizer ในตาราง events หรือไม่
      // ถ้าไม่มี ให้ลบออกจาก query นี้
      'INSERT INTO events (title, description, event_date, location, image_url) VALUES (?, ?, ?, ?, ?)',
      [eventData.title, eventData.description, eventData.event_date, eventData.location, eventData.image_url]
    );
    return result;
  }
};

module.exports = Event;
