import React, { useState, useEffect } from 'react';
import BackgroundLayout from '../layout/BackgroundLayout';
import { Container, Row, Col, Card, Form, InputGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    setError('');
    try {
      // ใช้ endpoint /api/alumni ที่ backend มีจริง
      const response = await axios.get('http://localhost:5000/api/alumni');
      // ป้องกันกรณี response ไม่ใช่ array
      setAlumni(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      // เพิ่ม log error เพื่อ debug
      console.error('Error fetching alumni:', err, err?.response?.data);
      setError('ไม่สามารถโหลดข้อมูลศิษย์เก่าได้');
    } finally {
      setLoading(false);
    }
  };

  const faculties = Array.from(new Set(alumni.map(a => a.faculty).filter(Boolean)));
  const years = Array.from(new Set(alumni.map(a => a.graduation_year).filter(Boolean))).sort((a, b) => b - a);

  const filteredAlumni = alumni.filter(person => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      (person.name || '').toLowerCase().includes(q) ||
      (person.faculty || '').toLowerCase().includes(q) ||
      (person.major || '').toLowerCase().includes(q) ||
      (person.occupation || '').toLowerCase().includes(q) ||
      (person.position || '').toLowerCase().includes(q) ||
      (person.workplace || '').toLowerCase().includes(q) ||
      (person.graduation_year ? String(person.graduation_year) : '').includes(q);
    const matchFaculty = !faculty || person.faculty === faculty;
    const matchYear = !year || String(person.graduation_year) === year;
    return matchSearch && matchFaculty && matchYear;
  });

  return (
    <BackgroundLayout>
      <Container className="py-5 alumni-bg" style={{ minHeight: '100vh', borderRadius: 24 }}>
        <div className="alumni-header text-center mb-4">
          <div className="d-flex justify-content-center align-items-center mb-2">
            <i className="fas fa-users fa-2x text-primary me-2" />
            <h2 className="fw-bold" style={{ letterSpacing: 1, marginBottom: 0 }}>ทำเนียบศิษย์เก่า</h2>
          </div>
          <div className="alumni-divider mx-auto mb-2" style={{ width: 80, height: 4, background: 'linear-gradient(90deg,#0d6efd,#6f42c1)', borderRadius: 2 }} />
          <p className="text-muted" style={{ fontSize: 18 }}>รวมรายชื่อศิษย์เก่าทั้งหมดของสถาบัน</p>
        </div>
        <Card className="mb-4 shadow-sm border-0 alumni-search-card" style={{ borderRadius: 18, maxWidth: 1100, margin: '0 auto', background: 'rgba(255,255,255,0.95)' }}>
          <Card.Body>
            <Row className="g-3">
              <Col md={5} sm={12}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="ค้นหา ชื่อ, คณะ, สาขา, อาชีพ, ปีที่จบ"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="alumni-search-input"
                  />
                  <InputGroup.Text style={{ cursor: 'pointer' }} onClick={() => setSearch('')}>
                    <i className="fas fa-times"></i>
                  </InputGroup.Text>
                </InputGroup>
              </Col>
              <Col md={4} sm={6}>
                <Form.Select value={faculty} onChange={e => setFaculty(e.target.value)} className="alumni-select">
                  <option value="">ทุกคณะ</option>
                  {faculties.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3} sm={6}>
                <Form.Select value={year} onChange={e => setYear(e.target.value)} className="alumni-select">
                  <option value="">ทุกปีที่จบ</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredAlumni.map(person => (
              <Col key={person.id}>
                <Card className="h-100 shadow-sm border-0 alumni-card" style={{
                  borderRadius: 18,
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                          marginRight: 20,
                          background: '#f5f5f5',
                          fontSize: 38,
                          color: '#b0b0b0'
                        }}
                      >
                        <i className="fas fa-user"></i>
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold alumni-name">{person.name}</h5>
                        <div className="text-muted alumni-faculty" style={{ fontSize: 15 }}>{person.faculty}</div>
                        <Badge bg="info" className="me-2 alumni-badge-year">{person.graduation_year}</Badge>
                        <Badge bg="secondary" className="alumni-badge-major">{person.major}</Badge>
                      </div>
                    </div>
                    <div className="mb-2">
                      <i className="fas fa-briefcase me-2 text-primary"></i>
                      <span className="fw-bold">อาชีพ:</span> {person.occupation || '-'}
                    </div>
                    {person.position && (
                      <div className="mb-2">
                        <i className="fas fa-user-tie me-2 text-primary"></i>
                        <span className="fw-bold">ตำแหน่ง:</span> {person.position}
                      </div>
                    )}
                    {person.workplace && (
                      <div className="mb-2">
                        <i className="fas fa-building me-2 text-primary"></i>
                        <span className="fw-bold">สถานที่ทำงาน:</span> {person.workplace}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        {filteredAlumni.length === 0 && !loading && !error && (
          <div className="text-center py-5">
            <h4>ไม่พบข้อมูลศิษย์เก่า</h4>
            <p className="text-muted">กรุณาลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง</p>
          </div>
        )}
      </Container>
    </BackgroundLayout>
  );
}

export default AlumniDirectory;


