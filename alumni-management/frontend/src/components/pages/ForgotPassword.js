import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('กรุณากรอกอีเมล');
      return;
    }
    setSending(true);
    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      setSuccess('ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบอีเมล');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <Card className="login-card mx-auto" style={{ maxWidth: '420px' }}>
          <Card.Body>
            <h3 className="mb-3 text-center">ลืมรหัสผ่าน</h3>
            <p className="text-center text-muted mb-4">
              กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งรหัสยืนยันไปยังอีเมลของคุณ
            </p>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>อีเมล</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="กรอกอีเมล"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <div className="d-grid">
                <Button type="submit" className="login-btn" disabled={sending}>
                  {sending ? <Spinner size="sm" animation="border" /> : 'ส่งรหัสยืนยัน'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ForgotPassword;
