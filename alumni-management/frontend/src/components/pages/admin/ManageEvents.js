import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Form, Row, Col, Modal, Badge, Alert, Spinner, Accordion } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th';
import AdminLayout from '../../layout/AdminLayout';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [selectedEventForReg, setSelectedEventForReg] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // สำหรับขยายแถวดูผู้ลงทะเบียน
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  // ดึงข้อมูลกิจกรรมพร้อมผู้ลงทะเบียน
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/events-with-registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching events:', err, err?.response?.data);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'ไม่สามารถโหลดข้อมูลกิจกรรมได้'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (event = null) => {
    setSelectedEvent(event);
    setFormData({
      title: event?.title || '',
      description: event?.description || '',
      event_date: event ? moment(event.event_date).format('YYYY-MM-DDTHH:mm') : '',
      location: event?.location || '',
      image: null
    });
    setImagePreview(event?.image_url ? `http://localhost:5000${event.image_url}` : null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      location: '',
      image: null
    });
    setImagePreview(null);
    setError('');
  };

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
    if (!formData.title.trim() || !formData.description.trim() || !formData.event_date || !formData.location.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
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

      if (selectedEvent) {
        await axios.put(
          `http://localhost:5000/api/admin/events/${selectedEvent.id}`,
          payload,
          config
        );
        Swal.fire('สำเร็จ', 'อัพเดทกิจกรรมเรียบร้อย', 'success');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/events',
          payload,
          config
        );
        Swal.fire('สำเร็จ', 'เพิ่มกิจกรรมเรียบร้อย', 'success');
      }
      handleCloseModal();
      fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ไม่สามารถบันทึกข้อมูลได้'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      });
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:5000/api/admin/events/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        Swal.fire('สำเร็จ', 'ลบกิจกรรมเรียบร้อย', 'success');
        fetchEvents();
      }
    } catch (err) {
      Swal.fire('ผิดพลาด', 'ไม่สามารถลบกิจกรรมได้', 'error');
    }
  };

  const handleShowRegistrations = async (event) => {
    setSelectedEventForReg(event);
    setShowRegistrations(true);
    setRegistrationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/events/${event.id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data);
    } catch (err) {
      setRegistrations([]);
      Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ลงทะเบียน', 'error');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // แก้ไขฟังก์ชันสำหรับดูรายละเอียดกิจกรรม
  const handleViewDetail = (event) => {
    setDetailEvent(event);
    setShowDetailModal(true);
  };

  // ฟิลเตอร์กิจกรรมตาม search
  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(search.trim().toLowerCase())
  );

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{color:'#2563eb', letterSpacing:1}}>
          <i className="fas fa-calendar-alt me-2 text-primary"></i>จัดการกิจกรรม
        </h2>
        <Button variant="primary" style={{borderRadius:8, fontWeight:500, boxShadow:'0 2px 8px #c7d2fe'}} onClick={() => handleShowModal()}>
          <i className="fas fa-plus me-2"></i>เพิ่มกิจกรรมใหม่
        </Button>
      </div>
      <div className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          type="text"
          placeholder="ค้นหาชื่อกิจกรรม..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{borderRadius:8, fontSize:15, boxShadow:'0 1px 4px #e0e7ff'}}
        />
      </div>
      {error && <Alert variant="danger" className="text-center" style={{maxWidth: 600, margin: '0 auto 1rem auto'}}>{error}</Alert>}
      <div style={{background:'rgba(255,255,255,0.98)', borderRadius:18, boxShadow:'0 2px 12px #e0e7ff', padding:'1.5rem 1rem'}}>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0" style={{borderRadius:12, overflow:'hidden'}}>
            <thead style={{background:'#f4f7fb'}}>
              <tr style={{fontWeight:600, color:'#2563eb'}}>
                <th style={{width:50}}>#</th>
                <th>ชื่อกิจกรรม</th>
                <th>วันที่จัด</th>
                <th>สถานที่</th>
                <th>รูปภาพ</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
                <th>ผู้ลงทะเบียน</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    ไม่พบข้อมูลกิจกรรม
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, idx) => (
                  <React.Fragment key={event.id}>
                    <tr style={{background: idx%2===0 ? '#f4f7fb' : '#fff'}}>
                      <td className="fw-bold text-primary">{idx + 1}</td>
                      <td className="fw-semibold"><i className="fas fa-calendar-alt me-2 text-primary"></i>{event.title}</td>
                      <td>{moment(event.event_date).locale('th').format('LLL')}</td>
                      <td>{event.location}</td>
                      <td>
                        {event.image_url && (
                          <img
                            src={`http://localhost:5000${event.image_url}`}
                            alt={event.title}
                            style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4, boxShadow:'0 1px 4px #c7d2fe' }}
                          />
                        )}
                      </td>
                      <td>
                        <Badge bg={moment(event.event_date).isAfter() ? 'success' : 'secondary'} style={{fontSize:13}}>
                          {moment(event.event_date).isAfter() ? 'กำลังจะมาถึง' : 'ผ่านไปแล้ว'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          style={{borderRadius:7, fontWeight:500}}
                          onClick={() => handleShowModal(event)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          style={{borderRadius:7, fontWeight:500}}
                          onClick={() => handleDelete(event.id)}>
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          style={{borderRadius:7, fontWeight:500}}
                          onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}
                        >
                          {expandedRow === event.id ? 'ซ่อน' : 'ดูผู้ลงทะเบียน'}
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          style={{borderRadius:7, fontWeight:500}}
                          onClick={() => handleViewDetail(event)}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </td>
                    </tr>
                    {expandedRow === event.id && (
                      <tr>
                        <td colSpan={9} style={{ background: '#f8fafc' }}>
                          <div>
                            <strong>รายชื่อผู้ลงทะเบียน ({event.registrations.length} คน)</strong>
                            <Table size="sm" bordered responsive className="mt-2">
                              <thead style={{background:'#e0e7ff'}}>
                                <tr style={{color:'#2563eb'}}>
                                  <th>ลำดับ</th>
                                  <th>ชื่อ-นามสกุล</th>
                                  <th>อีเมล</th>
                                  <th>คณะ</th>
                                  <th>ปีที่จบ</th>
                                  <th>วันที่ลงทะเบียน</th>
                                </tr>
                              </thead>
                              <tbody>
                                {event.registrations.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="text-center text-muted py-3">
                                      ยังไม่มีผู้ลงทะเบียน
                                    </td>
                                  </tr>
                                ) : (
                                  event.registrations.map((reg, idx) => (
                                    <tr key={reg.id}>
                                      <td>{idx + 1}</td>
                                      <td>{reg.name}</td>
                                      <td>{reg.email}</td>
                                      <td>{reg.faculty}</td>
                                      <td>{reg.graduation_year}</td>
                                      <td>{new Date(reg.registered_at).toLocaleString('th-TH')}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
              <i className="fas fa-calendar-alt me-2 text-primary"></i>{selectedEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{background:'#f4f7fb'}}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ชื่อกิจกรรม *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    style={{borderRadius:8}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>วันที่และเวลา *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                    required
                    style={{borderRadius:8}}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>สถานที่ *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    style={{borderRadius:8}}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>เลือกรูปภาพ (อัพโหลด)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{borderRadius:8}}
                  />
                </Form.Group>
                {imagePreview && (
                  <div className="text-center mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: 8, boxShadow:'0 1px 8px #c7d2fe' }}
                    />
                  </div>
                )}
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>รายละเอียดกิจกรรม *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                style={{borderRadius:8}}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{background:'#e0e7ff', borderTop:'1.5px solid #c7d2fe'}}>
            <Button variant="secondary" onClick={handleCloseModal} style={{borderRadius:8, fontWeight:500}}>
              ยกเลิก
            </Button>
            <Button variant="primary" type="submit" style={{borderRadius:8, fontWeight:500}}>
              {selectedEvent ? 'บันทึกการแก้ไข' : 'เพิ่มกิจกรรม'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal แสดงรายชื่อผู้ลงทะเบียน */}
      <Modal show={showRegistrations} onHide={() => setShowRegistrations(false)} size="lg">
        <Modal.Header closeButton style={{background:'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', borderBottom:'1.5px solid #c7d2fe'}}>
          <Modal.Title style={{color:'#2563eb', fontWeight:700, fontSize:22}}>
            <i className="fas fa-users me-2 text-primary"></i>รายชื่อผู้ลงทะเบียนกิจกรรม: {selectedEventForReg?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background:'#f4f7fb'}}>
          {registrationLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive style={{background:'#f8fafc', borderRadius:8}}>
              <thead style={{background:'#e0e7ff'}}>
                <tr style={{color:'#2563eb'}}>
                  <th>ลำดับ</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>อีเมล</th>
                  <th>คณะ</th>
                  <th>ปีที่จบ</th>
                  <th>วันที่ลงทะเบียน</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      ยังไม่มีผู้ลงทะเบียน
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg, idx) => (
                    <tr key={reg.id}>
                      <td>{idx + 1}</td>
                      <td>{reg.name}</td>
                      <td>{reg.email}</td>
                      <td>{reg.faculty}</td>
                      <td>{reg.graduation_year}</td>
                      <td>{new Date(reg.registered_at).toLocaleString('th-TH')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer style={{background:'#e0e7ff', borderTop:'1.5px solid #c7d2fe'}}>
          <Button variant="secondary" onClick={() => setShowRegistrations(false)} style={{borderRadius:8, fontWeight:500}}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal แสดงรายละเอียดกิจกรรม */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{background:'linear-gradient(90deg, #e0e7ff 60%, #fff 100%)', borderBottom:'1.5px solid #c7d2fe'}}>
          <Modal.Title style={{color:'#2563eb', fontWeight:700, fontSize:22}}>
            <i className="fas fa-calendar-alt me-2 text-primary"></i>รายละเอียดกิจกรรม
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background:'#f4f7fb'}}>
          {detailEvent && (
            <>
              <h4 className="mb-3 text-primary"><i className="fas fa-calendar-alt me-2"></i>{detailEvent.title}</h4>
              <div className="mb-2">
                <strong>วันที่จัด:</strong> {moment(detailEvent.event_date).locale('th').format('LLL')}
              </div>
              <div className="mb-2">
                <strong>สถานที่:</strong> {detailEvent.location}
              </div>
              <div className="mb-3">
                <strong>รายละเอียด:</strong>
                <div className="mt-2 p-3 bg-light rounded" style={{minHeight:60}}>
                  {detailEvent.description}
                </div>
              </div>
              {detailEvent.image_url && (
                <div className="text-center mb-3">
                  <img
                    src={`http://localhost:5000${detailEvent.image_url}`}
                    alt={detailEvent.title}
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', boxShadow:'0 1px 8px #c7d2fe' }}
                  />
                </div>
              )}
              <div>
                <strong>สถานะ:</strong>{' '}
                <Badge bg={moment(detailEvent.event_date).isAfter() ? 'success' : 'secondary'} style={{fontSize:13}}>
                  {moment(detailEvent.event_date).isAfter() ? 'กำลังจะมาถึง' : 'ผ่านไปแล้ว'}
                </Badge>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{background:'#e0e7ff', borderTop:'1.5px solid #c7d2fe'}}>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)} style={{borderRadius:8, fontWeight:500}}>
            ปิด
          </Button>
        </Modal.Footer>
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
}

export default ManageEvents;

