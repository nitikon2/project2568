
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import AdminLayout from '../../layout/AdminLayout';
import addressData from '../../../assets/thai-address-full.json';

const ManageAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    student_id: '',
    email: '',
    phone: '',
    graduation_year: '',
    faculty: '',
    major: '',
    address_province: '',
    address_district: '',
    address_subdistrict: '',
    address_postcode: '',
    occupation: '',
    position: '',
    workplace: '',
    salary: '',
    current_address: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
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
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [amphoeOptions, setAmphoeOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [postcode, setPostcode] = useState('');

  // Dropdown logic เหมือนหน้า register
  useEffect(() => {
    setProvinceOptions(addressData.provinces.map(p => p.name));
  }, []);

  // เมื่อ province เปลี่ยน ให้ setAmphoeOptions และ setDistrictOptions (รองรับทั้งกรณีเลือกใหม่และกรณีแก้ไข)
  useEffect(() => {
    if (formData.address_province) {
      const province = addressData.provinces.find(p => p.name === formData.address_province);
      setAmphoeOptions(province ? province.amphoes.map(a => a.name) : []);
      // ถ้ามี address_district เดิม ให้ setDistrictOptions ทันที
      if (formData.address_district) {
        const amphoe = province ? province.amphoes.find(a => a.name === formData.address_district) : null;
        setDistrictOptions(amphoe ? amphoe.districts.map(d => d.name) : []);
      } else {
        setDistrictOptions([]);
      }
    } else {
      setAmphoeOptions([]);
      setDistrictOptions([]);
    }
  }, [formData.address_province, formData.address_district]);

  // เมื่อ district เปลี่ยน ให้ setDistrictOptions และ postcode (รองรับทั้งกรณีเลือกใหม่และกรณีแก้ไข)
  useEffect(() => {
    if (formData.address_province && formData.address_district) {
      const province = addressData.provinces.find(p => p.name === formData.address_province);
      const amphoe = province ? province.amphoes.find(a => a.name === formData.address_district) : null;
      setDistrictOptions(amphoe ? amphoe.districts.map(d => d.name) : []);
      // ถ้ามี address_subdistrict เดิม ให้ setPostcode ทันที
      if (formData.address_subdistrict) {
        const district = amphoe ? amphoe.districts.find(d => d.name === formData.address_subdistrict) : null;
        setPostcode(district ? district.zipcode : '');
      } else {
        setPostcode('');
      }
    }
  }, [formData.address_province, formData.address_district, formData.address_subdistrict]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // ดึงข้อมูล user ทั้งหมดที่ role = 'user'
      const response = await axios.get('http://localhost:5000/api/admin/alumni', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // รองรับทั้งกรณี backend ส่ง { status, alumni } หรือ array ตรงๆ
      let alumniList = [];
      if (Array.isArray(response.data)) {
        alumniList = response.data;
      } else if (response.data && response.data.alumni) {
        alumniList = response.data.alumni;
      }
      // กำหนดค่า default ให้ field ใหม่
      const alumniWithDefaults = alumniList.map(item => ({
        ...item,
        occupation: item.occupation || '',
        position: item.position || '',
        workplace: item.workplace || '',
        salary: item.salary || ''
      }));
      setAlumni(alumniWithDefaults);
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลศิษย์เก่าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (alumniData = null) => {
    setSelectedAlumni(alumniData);
    if (alumniData) {
      // แยกชื่อ-นามสกุล
      let firstName = '', lastName = '';
      if (alumniData.name) {
        const parts = alumniData.name.split(' ');
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ');
      }
      // เตรียม dropdown อำเภอ/ตำบล ให้แสดงค่าตามจังหวัด/อำเภอที่มีอยู่
      let amphoes = [], districts = [];
      if (alumniData.province) {
        const provinceObj = addressData.provinces.find(p => p.name === alumniData.province);
        amphoes = provinceObj ? provinceObj.amphoes.map(a => a.name) : [];
        if (alumniData.district) {
          const amphoeObj = provinceObj ? provinceObj.amphoes.find(a => a.name === alumniData.district) : null;
          districts = amphoeObj ? amphoeObj.districts.map(d => d.name) : [];
        }
      }
      setAmphoeOptions(amphoes);
      setDistrictOptions(districts);
      setFormData({
        title: alumniData.title || '',
        firstName,
        lastName,
        student_id: alumniData.student_id || '',
        email: alumniData.email || '',
        phone: alumniData.phone || '',
        graduation_year: alumniData.graduation_year || '',
        faculty: alumniData.faculty || '',
        major: alumniData.major || '',
        address_province: alumniData.province || '',
        address_district: alumniData.district || '',
        address_subdistrict: alumniData.subdistrict || '',
        address_postcode: alumniData.zipcode || '',
        occupation: alumniData.occupation || '',
        position: alumniData.position || '',
        workplace: alumniData.workplace || '',
        salary: alumniData.salary || '',
        current_address: alumniData.current_address || '',
        bio: alumniData.bio || '',
        password: '',
        confirmPassword: ''
      });
      setPostcode(alumniData.zipcode || '');
    } else {
      setFormData({
        title: '', firstName: '', lastName: '', student_id: '', email: '', phone: '', graduation_year: '', faculty: '', major: '', address_province: '', address_district: '', address_subdistrict: '', address_postcode: '', occupation: '', position: '', workplace: '', salary: '', current_address: '', bio: '', password: '', confirmPassword: ''
      });
      setAmphoeOptions([]);
      setDistrictOptions([]);
      setPostcode('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAlumni(null);
    setFormData({
      student_id: '',
      name: '',
      faculty: '',
      major: '',
      graduation_year: '',
      email: '',
      occupation: '',
      position: '',
      workplace: '',
      salary: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields (เหมือน register)
    if (!formData.title || !formData.firstName || !formData.lastName || !formData.student_id || !formData.email || !formData.phone || !formData.graduation_year || !formData.faculty || !formData.major) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (!/^[0-9]{12}$/.test(formData.student_id)) {
      setError('รหัสนักศึกษาต้องเป็นตัวเลข 12 หลัก');
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
      return;
    }
    if (!selectedAlumni && (!formData.password || formData.password.length < 6)) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (!selectedAlumni && formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        province: formData.address_province,
        district: formData.address_district,
        subdistrict: formData.address_subdistrict,
        zipcode: formData.address_postcode
      };
      if (selectedAlumni) {
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
        await axios.put(
          `http://localhost:5000/api/admin/alumni/${selectedAlumni.id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        Swal.fire('สำเร็จ', 'อัพเดทข้อมูลศิษย์เก่าเรียบร้อย', 'success');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/alumni',
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        Swal.fire('สำเร็จ', 'เพิ่มข้อมูลศิษย์เก่าเรียบร้อย', 'success');
      }
      handleCloseModal();
      await fetchAlumni();
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบข้อมูลศิษย์เก่านี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบข้อมูล',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/admin/alumni/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        Swal.fire('สำเร็จ', 'ลบข้อมูลศิษย์เก่าเรียบร้อย', 'success');
        fetchAlumni();
      }
    } catch (err) {
      Swal.fire('Error', 'ไม่สามารถลบข้อมูลศิษย์เก่าได้', 'error');
    }
  };

  // ฟิลเตอร์ข้อมูลตามช่องค้นหา
  const filteredAlumni = alumni.filter(person => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (person.student_id || '').toLowerCase().includes(q) ||
      (person.name || '').toLowerCase().includes(q) ||
      (person.faculty || '').toLowerCase().includes(q) ||
      (person.major || '').toLowerCase().includes(q) ||
      (person.graduation_year ? String(person.graduation_year) : '').includes(q) ||
      (person.email || '').toLowerCase().includes(q) ||
      (person.occupation || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{color:'#2563eb', letterSpacing:1}}>
          <i className="fas fa-user-graduate me-2 text-primary"></i>จัดการข้อมูลศิษย์เก่า
        </h2>
        <Button variant="primary" style={{borderRadius:8, fontWeight:500, boxShadow:'0 2px 8px #c7d2fe'}} onClick={() => handleShowModal()}>
          <i className="fas fa-user-plus me-2"></i>เพิ่มข้อมูลศิษย์เก่า
        </Button>
      </div>
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          type="text"
          placeholder="ค้นหา รหัสนักศึกษา, ชื่อ, คณะ, สาขาวิชา, ปีที่จบ, อีเมล, อาชีพ"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{borderRadius:8, fontSize:15, boxShadow:'0 1px 4px #e0e7ff'}}
        />
      </div>
      <div style={{background:'rgba(255,255,255,0.98)', borderRadius:18, boxShadow:'0 2px 12px #e0e7ff', padding:'1.5rem 1rem'}}>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0" style={{borderRadius:12, overflow:'hidden'}}>
            <thead style={{background:'#f4f7fb'}}>
              <tr style={{fontWeight:600, color:'#2563eb'}}>
                <th style={{width:50}}>#</th>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-นามสกุล</th>
                <th>คณะ</th>
                <th>สาขาวิชา</th>
                <th>ปีที่จบ</th>
                <th>อีเมล</th>
                <th>อาชีพ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumni.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    ไม่พบข้อมูลศิษย์เก่า
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((person, idx) => (
                  <tr key={person.id} style={{background: idx%2===0 ? '#f4f7fb' : '#fff'}}>
                    <td className="fw-bold text-primary">{idx + 1}</td>
                    <td>{person.student_id}</td>
                    <td><i className="fas fa-user-graduate me-2 text-primary"></i>{person.name}</td>
                    <td>{person.faculty}</td>
                    <td>{person.major}</td>
                    <td><span className="badge bg-info text-white" style={{fontSize:13}}>{person.graduation_year}</span></td>
                    <td>{person.email}</td>
                    <td>{person.occupation || '-'}</td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => handleShowModal(person)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{borderRadius:7, fontWeight:500}}
                        onClick={() => handleDelete(person.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton style={{background:'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', borderBottom:'1.5px solid #c7d2fe'}}>
            <Modal.Title style={{color:'#2563eb', fontWeight:700, fontSize:22}}>
              <i className="fas fa-user-edit me-2 text-primary"></i>{selectedAlumni ? 'แก้ไขข้อมูลศิษย์เก่า' : 'เพิ่มข้อมูลศิษย์เก่า'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{background:'#f4f7fb'}}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>คำนำหน้า <span className="text-danger">*</span></Form.Label>
                  <Form.Select required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}>
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>ชื่อ <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>นามสกุล <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>รหัสนักศึกษา <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" required pattern="\d{12}" value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mt-1">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>อีเมล <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>เบอร์โทรศัพท์ <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="tel" required pattern="\d{10}" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>ปีที่จบ <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" required min="2500" max={new Date().getFullYear() + 543} value={formData.graduation_year} onChange={e => setFormData({ ...formData, graduation_year: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mt-1">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>คณะ <span className="text-danger">*</span></Form.Label>
                  <Form.Select required value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value, major: '' })}>
                    <option value="">เลือกคณะ</option>
                    {Object.keys(majorOptionsByFaculty).map(fac => (
                      <option key={fac} value={fac}>{fac}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>สาขาวิชา <span className="text-danger">*</span></Form.Label>
                  <Form.Select required value={formData.major} onChange={e => setFormData({ ...formData, major: e.target.value })} disabled={!formData.faculty}>
                    <option value="">เลือกสาขาวิชา</option>
                    {formData.faculty && majorOptionsByFaculty[formData.faculty]?.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            {!selectedAlumni && (
              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>รหัสผ่าน <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="password" required minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>ยืนยันรหัสผ่าน <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="password" required value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} isInvalid={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''} />
                  </Form.Group>
                </Col>
              </Row>
            )}
            <hr className="my-3" />
            <Row className="g-3 mb-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>จังหวัด</Form.Label>
                  <Form.Select value={formData.address_province} onChange={e => {
                    const province = e.target.value;
                    setFormData(f => ({ ...f, address_province: province, address_district: '', address_subdistrict: '', address_postcode: '' }));
                    // update amphoeOptions
                    const provinceObj = addressData.provinces.find(p => p.name === province);
                    setAmphoeOptions(provinceObj ? provinceObj.amphoes.map(a => a.name) : []);
                    setDistrictOptions([]);
                    setPostcode('');
                  }}>
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
                  <Form.Select value={formData.address_district} onChange={e => {
                    const amphoe = e.target.value;
                    setFormData(f => ({ ...f, address_district: amphoe, address_subdistrict: '', address_postcode: '' }));
                    // update districtOptions
                    const provinceObj = addressData.provinces.find(p => p.name === formData.address_province);
                    const amphoeObj = provinceObj ? provinceObj.amphoes.find(a => a.name === amphoe) : null;
                    setDistrictOptions(amphoeObj ? amphoeObj.districts.map(d => d.name) : []);
                    setPostcode('');
                  }} disabled={!formData.address_province}>
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
                  <Form.Select value={formData.address_subdistrict} onChange={e => {
                    const subdistrict = e.target.value;
                    setFormData(f => ({ ...f, address_subdistrict: subdistrict }));
                    // update postcode
                    const provinceObj = addressData.provinces.find(p => p.name === formData.address_province);
                    const amphoeObj = provinceObj ? provinceObj.amphoes.find(a => a.name === formData.address_district) : null;
                    const districtObj = amphoeObj ? amphoeObj.districts.find(d => d.name === subdistrict) : null;
                    setPostcode(districtObj ? districtObj.zipcode : '');
                    setFormData(f => ({ ...f, address_postcode: districtObj ? districtObj.zipcode : '' }));
                  }} disabled={!formData.address_district}>
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
                  <Form.Control type="text" value={postcode} readOnly />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>อาชีพ</Form.Label>
                  <Form.Control type="text" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ตำแหน่งงาน</Form.Label>
                  <Form.Control type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>สถานที่ทำงาน</Form.Label>
                  <Form.Control type="text" value={formData.workplace} onChange={e => setFormData({ ...formData, workplace: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mt-1">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>เงินเดือน</Form.Label>
                  <Form.Control type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>ที่อยู่ปัจจุบัน</Form.Label>
                  <Form.Control as="textarea" rows={2} value={formData.current_address} onChange={e => setFormData({ ...formData, current_address: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mt-1">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>ข้อมูลเพิ่มเติม (Bio)</Form.Label>
                  <Form.Control as="textarea" rows={2} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{background:'#e0e7ff', borderTop:'1.5px solid #c7d2fe'}}>
            <Button variant="secondary" onClick={handleCloseModal} style={{borderRadius:8, fontWeight:500}}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit" style={{borderRadius:8, fontWeight:500}}>
              {selectedAlumni ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <style>{`
        table {
          font-size: 1.08rem;
        }
        th, td {
          white-space: nowrap;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }
        .card {
          padding: 12px 0;
        }
        @media (max-width: 991px) {
          table {
            font-size: 0.98rem;
          }
        }
        @media (max-width: 767px) {
          table {
            font-size: 0.93rem;
          }
        }
        @media (max-width: 480px) {
          table {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default ManageAlumni;
