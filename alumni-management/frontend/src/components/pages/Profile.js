import React, { useState, useEffect } from 'react';
import addressData from '../../assets/thai-address-full.json';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    graduation_year: user?.graduation_year || '',
    faculty: user?.faculty || '',
    major: user?.major || '',
    occupation: user?.occupation || '',
    position: user?.position || '',
    workplace: user?.workplace || '',
    salary: user?.salary || '',
    bio: user?.bio || '',
    province: user?.province || '',
    district: user?.district || '',
    subdistrict: user?.subdistrict || '',
    zipcode: user?.zipcode || ''
  });

  // ตัวเลือกคณะและสาขาวิชาเหมือนหน้าสมัครสมาชิก
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
  const facultyOptions = Object.keys(majorOptionsByFaculty);
  const currentMajors = formData.faculty && majorOptionsByFaculty[formData.faculty] ? majorOptionsByFaculty[formData.faculty] : [];

  // สำหรับ dropdown จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [amphoeOptions, setAmphoeOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [postcode, setPostcode] = useState(formData.zipcode || '');

  useEffect(() => {
    setProvinceOptions(addressData.provinces.map(p => p.name));
  }, []);

  useEffect(() => {
    if (formData.province) {
      const province = addressData.provinces.find(p => p.name === formData.province);
      setAmphoeOptions(province ? province.amphoes.map(a => a.name) : []);
      // ถ้า district เดิมไม่มีในจังหวัดใหม่ ให้รีเซ็ต
      if (!province || !province.amphoes.some(a => a.name === formData.district)) {
        setFormData(f => ({ ...f, district: '', subdistrict: '', zipcode: '' }));
        setDistrictOptions([]);
        setPostcode('');
      }
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.province && formData.district) {
      const province = addressData.provinces.find(p => p.name === formData.province);
      const amphoe = province ? province.amphoes.find(a => a.name === formData.district) : null;
      setDistrictOptions(amphoe ? amphoe.districts.map(d => d.name) : []);
      // ถ้า subdistrict เดิมไม่มีในอำเภอใหม่ ให้รีเซ็ต
      if (!amphoe || !amphoe.districts.some(d => d.name === formData.subdistrict)) {
        setFormData(f => ({ ...f, subdistrict: '', zipcode: '' }));
        setPostcode('');
      }
    }
  }, [formData.district]);

  useEffect(() => {
    if (formData.province && formData.district && formData.subdistrict) {
      const province = addressData.provinces.find(p => p.name === formData.province);
      const amphoe = province ? province.amphoes.find(a => a.name === formData.district) : null;
      const district = amphoe ? amphoe.districts.find(d => d.name === formData.subdistrict) : null;
      setPostcode(district ? district.zipcode : '');
      setFormData(f => ({ ...f, zipcode: district ? district.zipcode : '' }));
    }
  }, [formData.subdistrict]);
  const [profileImage, setProfileImage] = useState(user?.profile_image || '/default-avatar.png');
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setError('');
        const response = await axios.get(`http://localhost:5000/api/users/${storedUser.id}`);
        const userData = response.data;

        // DEBUG: แสดงค่าทุก field ที่ backend ส่งกลับมา
        console.log('userData from backend:', JSON.stringify(userData, null, 2));

        if (!userData) {
          throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        // ตรวจสอบว่าฟิลด์ที่ต้องการมีอยู่จริงหรือไม่
        if (
          typeof userData.position === 'undefined' ||
          typeof userData.workplace === 'undefined' ||
          typeof userData.salary === 'undefined' ||
          typeof userData.bio === 'undefined'
        ) {
          setError('Backend ไม่ส่งข้อมูล position, workplace, salary หรือ bio กรุณาตรวจสอบ backend /api/users/:id');
        }

        // อัพเดทข้อมูลใน localStorage และ state
        const updatedUser = { ...storedUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setProfileImage(
          updatedUser.profile_image
            ? updatedUser.profile_image.startsWith('/uploads/')
              ? `http://localhost:5000${updatedUser.profile_image}`
              : updatedUser.profile_image
            : '/default-avatar.png'
        );
        // ...existing code...
      } catch (err) {
        console.error('Error fetching user data:', err);
        const errorMessage = err.response?.data?.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
        setError(errorMessage);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Validate required fields
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.graduation_year ||
      !formData.faculty.trim() ||
      !formData.major.trim()
    ) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const safeFormData = {
        ...formData,
        occupation: formData.occupation ?? '',
        position: formData.position ?? '',
        workplace: formData.workplace ?? '',
        salary: formData.salary ?? '',
        bio: formData.bio ?? ''
      };
      const response = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        safeFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedUser = response.data.user || response.data;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
        setUser({ ...user, ...updatedUser });
        setSuccess('อัพเดทข้อมูลสำเร็จ');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      graduation_year: user?.graduation_year || '',
      faculty: user?.faculty || '',
      major: user?.major || '',
      occupation: user?.occupation || '',
      position: user?.position || '',
      workplace: user?.workplace || '',
      salary: user?.salary || '',
      bio: user?.bio || '',
      province: user?.province || '',
      district: user?.district || '',
      subdistrict: user?.subdistrict || '',
      zipcode: user?.zipcode || ''
    });
    setIsEditing(false);
    setError('');
  };

  // ฟังก์ชันอัปโหลดรูปโปรไฟล์
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('รองรับเฉพาะไฟล์ JPG หรือ PNG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }
    setImageUploading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profile_image', file);
      const res = await axios.post(
        `http://localhost:5000/api/users/${user.id}/profile-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (res.data && res.data.profile_image) {
        setProfileImage(res.data.profile_image);
        const updatedUser = { ...user, profile_image: res.data.profile_image };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess('เปลี่ยนรูปโปรไฟล์สำเร็จ');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถอัปโหลดรูปโปรไฟล์ได้');
    } finally {
      setImageUploading(false);
    }
  };

  if (!user) return null;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Row className="g-4 flex-column flex-lg-row">
            <Col lg={4} md={5} className="mb-4 mb-lg-0">
              <Card className="profile-sidebar shadow border-0" style={{ borderRadius: 24, background: 'linear-gradient(135deg, #e0e7ff 0%, #f9fafb 100%)' }}>
                <Card.Body className="text-center">
                  <div className="profile-image-container mb-3 position-relative">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="profile-image mb-2 shadow-lg"
                      style={{
                        border: '5px solid #fff',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                      onError={e => { e.target.src = '/default-avatar.png'; }}
                    />
                    <div className="d-flex justify-content-center">
                      <Form.Label
                        htmlFor="profile-image-upload"
                        className="btn btn-outline-primary mt-2 px-3"
                        style={{ borderRadius: 20, fontWeight: 500, cursor: imageUploading ? 'not-allowed' : 'pointer' }}
                        title="เปลี่ยนรูปโปรไฟล์"
                      >
                        <i className="fas fa-camera me-1"></i>
                        {imageUploading ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          'เปลี่ยนรูปโปรไฟล์'
                        )}
                        <Form.Control
                          id="profile-image-upload"
                          type="file"
                          accept="image/jpeg,image/png"
                          style={{ display: 'none' }}
                          disabled={imageUploading}
                          onChange={handleProfileImageChange}
                        />
                      </Form.Label>
                    </div>
                  </div>
                  <h4 className="mb-1 fw-bold" style={{ fontSize: 22 }}>{user.name}</h4>
                  <div className="text-muted mb-2" style={{ fontSize: 16 }}>{user.faculty}</div>
                  <div className="mb-3">
                    <span className="badge bg-info text-dark me-2" style={{ fontSize: 14 }}>
                      {user.graduation_year} <span className="ms-1">ปีจบ</span>
                    </span>
                    <span className="badge bg-secondary" style={{ fontSize: 14 }}>
                      {user.major}
                    </span>
                  </div>
                  <hr className="my-3" />
                  <div className="text-start px-2">
                    <div className="mb-2">
                      <i className="fas fa-phone-alt me-2 text-primary"></i>
                      <span className="fw-bold">เบอร์:</span> <span className="ms-1">{user.phone || '-'}</span>
                    </div>
                    <div className="mb-2">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      <span className="fw-bold">อีเมล:</span> <span className="ms-1">{user.email}</span>
                    </div>
                    {user.occupation && (
                      <div className="mb-2">
                        <i className="fas fa-briefcase me-2 text-primary"></i>
                        <span className="fw-bold">อาชีพ:</span> <span className="ms-1">{user.occupation}</span>
                      </div>
                    )}
                    <div className="mb-2">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      <span className="fw-bold">ที่อยู่:</span>
                      <span className="ms-1">
                        {user.province || '-'} / {user.district || '-'} / {user.subdistrict || '-'} / {user.zipcode || '-'}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8} md={7}>
              <Card className="profile-details shadow border-0" style={{ borderRadius: 24 }}>
                <Card.Body>
                  {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                  {success && <Alert variant="success" className="mb-3">{success}</Alert>}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                    <h3 className="fw-bold mb-0" style={{ letterSpacing: 1, fontSize: 24 }}>ข้อมูลส่วนตัว</h3>
                    {isEditing ? (
                      <div>
                        <Button variant="success" onClick={handleSubmit} className="me-2 px-4" style={{ borderRadius: 20 }}>
                          <i className="fas fa-save me-1"></i> บันทึก
                        </Button>
                        <Button variant="outline-secondary" onClick={handleCancel} style={{ borderRadius: 20 }}>
                          <i className="fas fa-times me-1"></i> ยกเลิก
                        </Button>
                      </div>
                    ) : (
                      <Button variant="primary" onClick={() => setIsEditing(true)} className="px-4" style={{ borderRadius: 20 }}>
                        <i className="fas fa-edit me-1"></i> แก้ไขข้อมูล
                      </Button>
                    )}
                  </div>
                  <hr className="mb-4" />
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>ชื่อ-นามสกุล</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.name}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>อีเมล</Form.Label>
                          <Form.Control
                            type="email"
                            value={formData.email}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>จังหวัด</Form.Label>
                          <Form.Select
                            value={formData.province}
                            disabled={!isEditing}
                            onChange={e => setFormData({ ...formData, province: e.target.value })}
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
                            value={formData.district}
                            disabled={!isEditing || !formData.province}
                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                          >
                            <option value="">{formData.district ? formData.district : 'เลือกอำเภอ'}</option>
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
                            value={formData.subdistrict}
                            disabled={!isEditing || !formData.district}
                            onChange={e => setFormData({ ...formData, subdistrict: e.target.value })}
                          >
                            <option value="">{formData.subdistrict ? formData.subdistrict : 'เลือกตำบล'}</option>
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
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>เบอร์โทรศัพท์</Form.Label>
                          <Form.Control
                            type="tel"
                            value={formData.phone}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>ปีที่จบการศึกษา</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.graduation_year}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>คณะ</Form.Label>
                          {isEditing ? (
                            <Form.Select
                              value={formData.faculty}
                              onChange={e => setFormData({ ...formData, faculty: e.target.value, major: '' })}
                            >
                              <option value="">เลือกคณะ</option>
                              {facultyOptions.map(fac => (
                                <option key={fac} value={fac}>{fac}</option>
                              ))}
                            </Form.Select>
                          ) : (
                            <Form.Control
                              type="text"
                              value={formData.faculty}
                              disabled
                            />
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>สาขาวิชา</Form.Label>
                          {isEditing ? (
                            <Form.Select
                              value={formData.major}
                              onChange={e => setFormData({ ...formData, major: e.target.value })}
                              disabled={!formData.faculty}
                            >
                              <option value="">เลือกสาขาวิชา</option>
                              {currentMajors.map(major => (
                                <option key={major} value={major}>{major}</option>
                              ))}
                            </Form.Select>
                          ) : (
                            <Form.Control
                              type="text"
                              value={formData.major}
                              disabled
                            />
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>อาชีพปัจจุบัน</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.occupation}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>ตำแหน่งงาน</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.position}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>สถานที่ทำงาน</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.workplace}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>เงินเดือน</Form.Label>
                          <Form.Control
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="0"
                            value={formData.salary}
                            disabled={!isEditing}
                            onChange={(e) => {
                              // รับเฉพาะตัวเลขเท่านั้น
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setFormData({ ...formData, salary: val });
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold" style={{ fontSize: 18 }}>เกี่ยวกับฉัน</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.bio}
                        disabled={!isEditing}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="เล่าเกี่ยวกับตัวคุณ..."
                        style={{ background: isEditing ? '#fff' : '#f8f9fa', fontSize: 16 }}
                      />
                      {!formData.bio && !isEditing && (
                        <div className="text-muted mt-2" style={{ fontSize: 15 }}>
                          <i className="fas fa-info-circle me-1"></i>
                          ยังไม่มีข้อมูลเกี่ยวกับคุณ
                        </div>
                      )}
                    </Form.Group>
                    {isEditing && (
                      <div className="d-flex justify-content-end">
                        <Button variant="success" type="submit" className="me-2 px-4" style={{ borderRadius: 20 }}>
                          <i className="fas fa-save me-1"></i> บันทึก
                        </Button>
                        <Button variant="outline-secondary" type="button" onClick={handleCancel} style={{ borderRadius: 20 }}>
                          <i className="fas fa-times me-1"></i> ยกเลิก
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;



