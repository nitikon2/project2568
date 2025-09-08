// Signup.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const initialState = {
  email: '',
  password: '',
  confirmPassword: '',
  accepted: false,
};

function Signup() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // ฟังก์ชันตรวจสอบข้อมูล
  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'กรุณากรอกอีเมล';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    else if (form.password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    if (!form.accepted) newErrors.accepted = 'กรุณายอมรับเงื่อนไขการใช้งาน';
    return newErrors;
  };

  // ฟังก์ชันเมื่อกดสมัครสมาชิก
  const handleSubmit = e => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSuccess('สมัครสมาชิกสำเร็จ!');
      setForm(initialState);
    } else {
      setSuccess('');
    }
  };

  // ฟังก์ชันเปลี่ยนค่าในฟอร์ม
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-lg border-0 signup-card" style={{ borderRadius: 24, background: 'linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%)' }}>
            <Card.Body className="p-4">
              <h2 className="mb-4 text-center fw-bold" style={{ letterSpacing: 1, color: '#2d3a4b' }}>สมัครสมาชิก</h2>
              {success && <Alert variant="success" className="rounded-3 text-center fw-bold">{success}</Alert>}
              <Form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                {/* Email */}
                <Form.Group className="mb-4" controlId="signupEmail">
                  <Form.Label className="fw-semibold">อีเมล</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    isValid={form.email && !errors.email}
                    placeholder="your@email.com"
                    autoFocus
                    className="signup-input"
                  />
                  <Form.Text className="text-muted">ใช้สำหรับเข้าสู่ระบบและรับข่าวสาร</Form.Text>
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
                {/* Password */}
                {/* Password */}
                <Form.Group className="mb-4" controlId="signupPassword">
                  <Form.Label className="fw-semibold">รหัสผ่าน</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    isValid={form.password && !errors.password}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="signup-input"
                  />
                  <Form.Text className="text-muted">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</Form.Text>
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
                {/* Confirm Password */}
                {/* Confirm Password */}
                <Form.Group className="mb-4" controlId="signupConfirmPassword">
                  <Form.Label className="fw-semibold">ยืนยันรหัสผ่าน</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    isValid={form.confirmPassword && !errors.confirmPassword}
                    placeholder="กรอกซ้ำรหัสผ่าน"
                    className="signup-input"
                  />
                  <Form.Text className="text-muted">กรอกซ้ำรหัสผ่านเพื่อความถูกต้อง</Form.Text>
                  <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
                {/* Accept Terms */}
                {/* Accept Terms */}
                <Form.Group className="mb-4" controlId="signupAccepted">
                  <Form.Check
                    type="checkbox"
                    name="accepted"
                    label={<span className="fw-semibold">ฉันยอมรับเงื่อนไขการใช้งาน</span>}
                    checked={form.accepted}
                    onChange={handleChange}
                    isInvalid={!!errors.accepted}
                    feedback={errors.accepted}
                    className="signup-checkbox"
                  />
                  <Form.Text className="text-muted">โปรดอ่านและยอมรับก่อนสมัครสมาชิก</Form.Text>
                </Form.Group>
                {/* Submit Button */}
                {/* Submit Button */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 signup-btn"
                  style={{ borderRadius: 24, fontWeight: 600, fontSize: 18, boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }}
                >
                  สมัครสมาชิก
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;


// CSS เสริมสำหรับดีไซน์โมเดิร์น (สามารถย้ายไปไฟล์ CSS ได้)
// .signup-card { background: linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%); border-radius: 24px; }
// .signup-input { font-size: 17px; border-radius: 16px; padding: 12px 16px; transition: box-shadow 0.2s; }
// .signup-input:focus { box-shadow: 0 0 0 2px #a3bffa; border-color: #5b9aff; }
// .signup-btn { border-radius: 24px; font-size: 18px; font-weight: 600; box-shadow: 0 2px 8px rgba(44,62,80,0.08); }
// .signup-checkbox { accent-color: #5b9aff; }

/*
  - ดีไซน์โมเดิร์น เรียบหรู เว้นระยะหายใจดี
  - Responsive มือถือ/แท็บเล็ต/เดสก์ท็อป
  - สถานะฟอร์มครบ (focus/hover/error/success) + ข้อความช่วยเหลือ
  - Validation อีเมล/รหัสผ่าน/ยืนยันรหัสผ่าน/ยอมรับเงื่อนไข
  - ใช้ Bootstrap + CSS เสริม
*/
