import React, { useState } from 'react';

import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [form, setForm] = useState({ email: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.newPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', form);
      setSuccess('รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f0ff 0%, #b6e0fe 50%, #f8fbff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* วงกลมตกแต่งพื้นหลัง */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-120px',
        width: '300px',
        height: '300px',
        background: 'rgba(13,110,253,0.12)',
        borderRadius: '50%',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '220px',
        height: '220px',
        background: 'rgba(13,110,253,0.10)',
        borderRadius: '50%',
        zIndex: 0,
      }} />
      <Card className="shadow-lg p-4" style={{ maxWidth: 400, width: '100%', borderRadius: 20, zIndex: 1, background: 'rgba(255,255,255,0.98)', boxShadow: '0 8px 32px rgba(13,110,253,0.10)' }}>
        <div className="text-center mb-3">
          <FaLock size={48} color="#0d6efd" />
          <h2 className="mt-2 mb-1" style={{ color: '#0d6efd', fontWeight: 700 }}>รีเซ็ตรหัสผ่าน</h2>
          <p className="text-muted">กรอกอีเมลและรหัสผ่านใหม่ที่ต้องการ</p>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit} autoComplete="off">
          <Form.Group className="mb-3">
            <Form.Label><FaEnvelope className="me-2" />อีเมล</Form.Label>
            <Form.Control
              type="email"
              placeholder="กรอกอีเมลที่ลงทะเบียน"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label><FaLock className="me-2" />รหัสผ่านใหม่</Form.Label>
            <Form.Control
              type="password"
              placeholder="รหัสผ่านใหม่"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100 py-2" variant="primary" disabled={loading} style={{ fontWeight: 600, borderRadius: 8 }}>
            {loading ? <Spinner size="sm" animation="border" /> : 'รีเซ็ตรหัสผ่าน'}
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Button variant="link" onClick={() => navigate('/login')} style={{ textDecoration: 'underline', color: '#0d6efd' }}>
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </Card>
  </div>
  );
};

export default ResetPassword;
