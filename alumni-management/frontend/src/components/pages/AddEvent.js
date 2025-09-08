import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.title.trim() || !formData.description.trim() || !formData.event_date || !formData.location.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('event_date', formData.event_date);
      payload.append('location', formData.location.trim());
      if (formData.image) payload.append('image', formData.image);

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('http://localhost:5000/api/admin/events', payload, config);
      setSuccess('เพิ่มกิจกรรมเรียบร้อย');
      setTimeout(() => {
        navigate('/events');
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ไม่สามารถเพิ่มกิจกรรมได้'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body>
          <h2 className="mb-4 text-center">เพิ่มกิจกรรมใหม่</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>ชื่อกิจกรรม *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>รายละเอียดกิจกรรม *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>วันที่และเวลา *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>สถานที่ *</Form.Label>
              <Form.Control
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เลือกรูปภาพ (อัพโหลด)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>
            {imagePreview && (
              <div className="text-center mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                  className="rounded"
                />
              </div>
            )}
            <div className="d-grid">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : 'เพิ่มกิจกรรม'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddEvent;
