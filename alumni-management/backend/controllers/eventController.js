const Event = require('../models/Event');

const eventController = {
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.getAll();
      res.json(events);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม' });
    }
  },

  getEventById: async (req, res) => {
    try {
      const event = await Event.getById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'ไม่พบกิจกรรมที่ต้องการ' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error getting event:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม' });
    }
  }
};

module.exports = eventController;
