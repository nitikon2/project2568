import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';
import addressData from '../../assets/thai-address-full.json';

function Register() {
  // สาขาวิชาแต่ละคณะ
  const majorOptionsByFaculty = {
    'คณะครุศาสตร์': ['ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์', 'สังคมศึกษา', 'พลศึกษา', 'คอมพิวเตอร์ศึกษา', 'ปฐมวัย', 'ประถมศึกษา'],
    'คณะวิทยาศาสตร์และเทคโนโลยี': ['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีอาหาร', 'ชีววิทยา', 'เคมี', 'ฟิสิกส์', 'คณิตศาสตร์'],
    'คณะมนุษยศาสตร์และสังคมศาสตร์': ['ภาษาอังกฤษ', 'ภาษาไทย', 'รัฐศาสตร์', 'ประวัติศาสตร์', 'สังคมวิทยา'],
    'คณะวิทยาการจัดการ': ['การบัญชี', 'การตลาด', 'การจัดการทั่วไป', 'เศรษฐศาสตร์', 'การเงิน'],
    'คณะเทคโนโลยีการเกษตร': ['สัตวศาสตร์', 'พืชศาสตร์', 'เทคโนโลยีการเกษตร'],
    'คณะเทคโนโลยีสารสนเทศ': ['เทคโนโลยีสารสนเทศ', 'วิทยาการข้อมูล', 'นวัตกรรมดิจิทัล'],
    'คณะวิศวกรรมศาสตร์': ['วิศวกรรมโยธา', 'วิศวกรรมไฟฟ้า', 'วิศวกรรมเครื่องกล'],
    'คณะพยาบาลศาสตร์': ['พยาบาลศาสตร์'],
    'คณะสาธารณสุขศาสตร์': ['สาธารณสุขศาสตร์', 'อนามัยสิ่งแวดล้อม'],
    'คณะนิติศาสตร์': ['นิติศาสตร์'],
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    student_id: '',
    email: '',
    phone: '',
    graduation_year: '',
    faculty: '',
    major: '',
    address_subdistrict: '',
    address_district: '',
    address_province: '',
    address_postcode: '',
    occupation: '',
    position: '',
    workplace: '',
    salary: '',
    current_address: ''
  });
  const [validated, setValidated] = useState(false);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [amphoeOptions, setAmphoeOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [postcode, setPostcode] = useState('');

  useEffect(() => {
    // ดึงรายชื่อจังหวัดจาก json ที่ export มาใหม่
    setProvinceOptions(addressData.provinces.map(p => p.name));
  }, []);

  useEffect(() => {
    if (formData.address_province) {
      // ดึงรายชื่ออำเภอจากจังหวัดที่เลือก
      const province = addressData.provinces.find(p => p.name === formData.address_province);
      setAmphoeOptions(province ? province.amphoes.map(a => a.name) : []);
      setFormData(f => ({ ...f, address_district: '', address_subdistrict: '', address_postcode: '' }));
      setDistrictOptions([]);
      setPostcode('');
    }
  }, [formData.address_province]);

  useEffect(() => {
    if (formData.address_province && formData.address_district) {
      // ดึงรายชื่อตำบลจากอำเภอที่เลือก
      const province = addressData.provinces.find(p => p.name === formData.address_province);
      const amphoe = province ? province.amphoes.find(a => a.name === formData.address_district) : null;
      setDistrictOptions(amphoe ? amphoe.districts.map(d => d.name) : []);
      setFormData(f => ({ ...f, address_subdistrict: '', address_postcode: '' }));
      setPostcode('');
    }
  }, [formData.address_district]);

  useEffect(() => {
    if (formData.address_province && formData.address_district && formData.address_subdistrict) {
      // ดึงรหัสไปรษณีย์จากตำบลที่เลือก
      const province = addressData.provinces.find(p => p.name === formData.address_province);
      const amphoe = province ? province.amphoes.find(a => a.name === formData.address_district) : null;
      const district = amphoe ? amphoe.districts.find(d => d.name === formData.address_subdistrict) : null;
      setPostcode(district ? district.zipcode : '');
      setFormData(f => ({ ...f, address_postcode: district ? district.zipcode : '' }));
    }
  }, [formData.address_subdistrict]);

  const validateForm = () => {
    setValidated(true);
    setError('');
    const requiredFields = [
      'title', 'firstName', 'lastName', 'password', 'student_id', 'email', 'phone',
      'graduation_year', 'faculty', 'major'
    ];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError('กรุณากรอกข้อมูลให้ครบทุกช่องที่มีเครื่องหมาย *');
        return false;
      }
    }
    if (!/^\d{12}$/.test(formData.student_id)) {
      setError('รหัสนักศึกษาต้องเป็นตัวเลข 12 หลัก');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      return false;
    }
    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, firstName, lastName, address_province, address_district, address_subdistrict, address_postcode, ...rest } = formData;
      const dataToSubmit = {
        ...rest,
        name: `${firstName} ${lastName}`.trim(),
        province: address_province,
        district: address_district,
        subdistrict: address_subdistrict,
        zipcode: address_postcode
      };
      const response = await axios.post('http://localhost:5000/api/users/register', dataToSubmit);
      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          text: 'กรุณาเข้าสู่ระบบ',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)' }}>
      <Container>
        <Card className="register-card mx-auto shadow-lg" style={{ maxWidth: 900, borderRadius: 20, marginTop: 40, marginBottom: 40 }}>
          <Card.Body>
            <div className="text-center mb-4">
              <img src={logo} alt="Logo" className="register-logo mb-3" style={{ width: 100, height: 100 }} />
              <h2 className="fw-bold mb-2">ลงทะเบียนศิษย์เก่า</h2>
              <p className="text-muted">กรุณากรอกข้อมูลให้ครบถ้วน <span className="text-danger">*</span></p>
            </div>
            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>คำนำหน้า <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    >
                      <option value="">เลือกคำนำหน้า</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      กรุณาเลือกคำนำหน้า
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>ชื่อ <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">
                      กรุณากรอกชื่อ
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>นามสกุล <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">
                      กรุณากรอกนามสกุล
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>รหัสนักศึกษา <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      required
                      pattern="\d{12}"
                      value={formData.student_id}
                      onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                      12 หลัก
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>อีเมล <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>เบอร์โทรศัพท์ <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      required
                      pattern="\d{10}"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    <Form.Text className="text-muted">
                      10 หลัก
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>ปีที่จบ <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      required
                      min="2500"
                      max={new Date().getFullYear() + 543}
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({...formData, graduation_year: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>คณะ <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      required
                      value={formData.faculty}
                      onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                    >
                      <option value="">เลือกคณะ</option>
                      <option value="คณะครุศาสตร์">คณะครุศาสตร์</option>
                      <option value="คณะวิทยาศาสตร์และเทคโนโลยี">คณะวิทยาศาสตร์และเทคโนโลยี</option>
                      <option value="คณะมนุษยศาสตร์และสังคมศาสตร์">คณะมนุษยศาสตร์และสังคมศาสตร์</option>
                      <option value="คณะวิทยาการจัดการ">คณะวิทยาการจัดการ</option>
                      <option value="คณะเทคโนโลยีการเกษตร">คณะเทคโนโลยีการเกษตร</option>
                      <option value="คณะเทคโนโลยีสารสนเทศ">คณะเทคโนโลยีสารสนเทศ</option>
                      <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                      <option value="คณะพยาบาลศาสตร์">คณะพยาบาลศาสตร์</option>
                      <option value="คณะสาธารณสุขศาสตร์">คณะสาธารณสุขศาสตร์</option>
                      <option value="คณะนิติศาสตร์">คณะนิติศาสตร์</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>สาขาวิชา <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      required
                      value={formData.major}
                      onChange={e => setFormData({ ...formData, major: e.target.value })}
                      disabled={!formData.faculty}
                    >
                      <option value="">เลือกสาขาวิชา</option>
                      {formData.faculty && majorOptionsByFaculty[formData.faculty]?.map(major => (
                        <option key={major} value={major}>{major}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>รหัสผ่าน <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <Form.Text className="text-muted">
                      อย่างน้อย 6 ตัวอักษร
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>ยืนยันรหัสผ่าน <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      isInvalid={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                    />
                    <Form.Control.Feedback type="invalid">
                      รหัสผ่านไม่ตรงกัน
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <hr className="my-4" />
              <Row className="g-3 mb-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>จังหวัด</Form.Label>
                    <Form.Select
                      value={formData.address_province}
                      onChange={e => setFormData({...formData, address_province: e.target.value})}
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinceOptions.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>อำเภอ</Form.Label>
                    <Form.Select
                      value={formData.address_district}
                      onChange={e => setFormData({...formData, address_district: e.target.value})}
                      disabled={!formData.address_province}
                    >
                      <option value="">เลือกอำเภอ</option>
                      {amphoeOptions.map(amphoe => (
                        <option key={amphoe} value={amphoe}>{amphoe}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>ตำบล</Form.Label>
                    <Form.Select
                      value={formData.address_subdistrict}
                      onChange={e => setFormData({...formData, address_subdistrict: e.target.value})}
                      disabled={!formData.address_district}
                    >
                      <option value="">เลือกตำบล</option>
                      {districtOptions.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>รหัสไปรษณีย์</Form.Label>
                    <Form.Control
                      type="text"
                      value={postcode}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>อาชีพ</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>ตำแหน่งงาน</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>สถานที่ทำงาน</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.workplace}
                      onChange={(e) => setFormData({...formData, workplace: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3 mt-1">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>เงินเดือน</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>ที่อยู่ปัจจุบัน</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.current_address}
                      onChange={(e) => setFormData({...formData, current_address: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-grid gap-2 mt-4">
                <Button 
                  type="submit" 
                  className="register-btn py-2 fw-bold"
                  style={{ fontSize: 18, borderRadius: 12 }}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" animation="border" /> : 'ลงทะเบียน'}
                </Button>
              </div>
              <div className="text-center mt-3">
                <span className="text-muted">มีบัญชีอยู่แล้ว? </span>
                <Link to="/login" className="register-link">เข้าสู่ระบบที่นี่</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Register;

