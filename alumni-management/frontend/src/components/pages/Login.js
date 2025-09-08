import React, { useState } from 'react';
import BackgroundLayout from '../layout/BackgroundLayout';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/images/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // ตรวจสอบข้อมูลก่อนส่ง
        if (!formData.email || !formData.password) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน');
            setLoading(false);
            return;
        }

        const response = await axios.post('http://localhost:5000/api/users/login', formData);
        console.log('Login response:', response.data);

        const { token, user } = response.data;
        if (!token || !user) {
            throw new Error('ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง');
        }

        // เก็บข้อมูลใน localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // ตั้งค่า axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect ตาม role
        if (user.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } catch (err) {
        console.error('Login error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
        setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <Container>
        <Card className="login-card mx-auto" style={{ maxWidth: '450px' }}>
          <Card.Body>
            <div className="text-center mb-4">
              <img
                src={logo}
                alt="Logo"
                className="login-logo mb-4"
              />
              <h2 className="login-title">ยินดีต้อนรับ</h2>
              <p className="login-subtitle">
                ระบบศิษย์เก่า มหาวิทยาลัยราชภัฏมหาสารคาม
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="form-floating mb-4">
                <Form.Control
                  type="email"
                  className="login-input"
                  placeholder="อีเมล"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Form.Label>อีเมล</Form.Label>
              </Form.Group>

              <Form.Group className="form-floating mb-4">
                <Form.Control
                  type="password"
                  className="login-input"
                  placeholder="รหัสผ่าน"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <Form.Label>รหัสผ่าน</Form.Label>
              </Form.Group>

              <div className="d-grid mt-3">
                <Button type="submit" className="login-btn" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : 'เข้าสู่ระบบ'}
                </Button>
              </div>

              <div className="text-center mt-3">
                <Link to="/reset-password" className="text-primary" style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <div className="text-center mt-2">
                ยังไม่มีบัญชี? <Link to="/register" className="register-link">ลงทะเบียนที่นี่</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </BackgroundLayout>
  );
}

export default Login;

