import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddNews() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationError, setValidationError] = useState({
    title: '',
    content: '',
    image: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'กรุณาระบุหัวข้อข่าว';
    }
    if (!formData.content.trim()) {
      errors.content = 'กรุณาระบุเนื้อหา';
    }
    if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      errors.image = 'ขนาดไฟล์ต้องไม่เกิน 5MB';
    }
    setValidationError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError({
          ...validationError,
          image: 'ขนาดไฟล์ต้องไม่เกิน 5MB'
        });
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
      setValidationError({ ...validationError, image: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      // ตรวจสอบ token และ role
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!token || !user || user.role !== 'admin') {
        setError('คุณไม่มีสิทธิ์เพิ่มข่าวสาร กรุณาเข้าสู่ระบบในฐานะผู้ดูแลระบบ');
        setLoading(false);
        return;
      }

      const payload = new FormData();
      payload.append('title', formData.title || '');
      payload.append('content', formData.content || '');
      if (formData.image) payload.append('image', formData.image);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // ต้องเรียก endpoint /api/admin/news เท่านั้น (ไม่ใช่ /api/news)
      await axios.post('http://localhost:5000/api/admin/news', payload, config);

      setSuccess('เพิ่มข่าวสารเรียบร้อย');
      setTimeout(() => {
        navigate('/admin/news');
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ไม่สามารถเพิ่มข่าวสารได้'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: 600 }}>
        <Card.Body>
          <h2 className="mb-4 text-center">เพิ่มข่าวสารใหม่</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>หัวข้อข่าว *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isInvalid={!!validationError.title}
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationError.title}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เนื้อหา *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                isInvalid={!!validationError.content}
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationError.content}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>เลือกรูปภาพ (ไม่จำเป็น)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                isInvalid={!!validationError.image}
              />
              <Form.Text className="text-muted">
                รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {validationError.image}
              </Form.Control.Feedback>
            </Form.Group>
            {imagePreview && (
              <div className="mt-3 text-center">
                <p className="mb-2">ตัวอย่างรูปภาพ:</p>
                <Image
                  src={imagePreview}
                  style={{ maxHeight: '200px' }}
                  thumbnail
                />
                <Button
                  variant="link"
                  className="d-block mx-auto mt-2"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: null });
                  }}
                >
                  ลบรูปภาพ
                </Button>
              </div>
            )}
            <div className="d-grid">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : 'เพิ่มข่าวสาร'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddNews;

