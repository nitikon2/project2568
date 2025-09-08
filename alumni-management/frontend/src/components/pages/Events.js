

import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import BackgroundLayout from '../layout/BackgroundLayout';
import { Container, Row, Col, Card, Button, Badge, Alert, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Events() {
  // ปรับ marginTop เฉพาะ filter
  const getHeaderMarginTop = () => {
    if (filter === 'all') return 20;
    return 0; // ขยับขึ้นสำหรับ upcoming/past
  };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState({});
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | upcoming | past
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    if (user) fetchRegisteredEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลกิจกรรม กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/' + user.id + '/event-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegisteredEvents(response.data.map(r => r.event_id));
    } catch (err) {
      setRegisteredEvents([]);
    }
  };

  const handleRegister = async (eventId) => {
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('สำเร็จ', 'ลงทะเบียนกิจกรรมเรียบร้อย', 'success');
      setRegisteredEvents(prev => [...prev, eventId]);
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถลงทะเบียนได้', 'error');
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleUnregister = async (eventId) => {
    setRegistering(prev => ({ ...prev, [eventId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('สำเร็จ', 'ยกเลิกการลงทะเบียนเรียบร้อย', 'success');
      setRegisteredEvents(prev => prev.filter(id => id !== eventId));
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถยกเลิกลงทะเบียนได้', 'error');
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // แยกวันที่และเวลาออกจาก event_date (datetime-local)
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd MMMM yyyy', { locale: th });
  };
  const formatTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'HH:mm น.');
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  // Skeleton loading
  const renderSkeleton = () => (
    <Row xs={1} md={2} lg={3} className="g-4">
      {[...Array(6)].map((_, idx) => (
        <Col key={idx}>
          <div className="skeleton-card" style={{height: 370, borderRadius: 20, background: 'linear-gradient(135deg, #f1f5f9 60%, #e0e7ff 100%)', marginBottom: 10}}></div>
        </Col>
      ))}
    </Row>
  );

  // Share event
  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.origin + `/events/${event.id}`
      });
    } else {
      Swal.fire('แชร์กิจกรรม', 'คัดลอกลิงก์กิจกรรมแล้ว', 'info');
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
    }
  };

  // Modal for event detail
  const openModal = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <BackgroundLayout>
      <Container style={{ maxWidth: 1200 }}>
        <div
          className="d-flex flex-column align-items-center"
          style={{ marginTop: getHeaderMarginTop(), marginBottom: 32 }}
        >
          <h2 className="fw-bold mb-2" style={{ color: '#2563eb', letterSpacing: 1.5, fontSize: 34, textShadow: '0 2px 8px #e0e7ff' }}>
            <i className="fas fa-calendar-alt me-2" style={{ color: '#facc15' }}></i>กิจกรรมศิษย์เก่า
          </h2>
          <p className="text-muted mb-3" style={{ fontSize: 19, fontWeight: 500, maxWidth: 600 }}>
            กิจกรรมและงานสังสรรค์อย่างเป็นทางการสำหรับศิษย์เก่า มหาวิทยาลัยราชภัฏมหาสารคาม
          </p>
          <hr style={{ width: 90, borderTop: '3px solid #2563eb', margin: '0 auto 18px auto', opacity: 0.25 }} />
          {/* Search and Filter Bar */}
          {/* กล่องค้นหาถูกลบออกตามคำขอ */}
        </div>
        {error && (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>เกิดข้อผิดพลาด</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => {
              setError('');
              setLoading(true);
              fetchEvents();
            }}>
              ลองใหม่อีกครั้ง
            </Button>
          </Alert>
        )}
        {loading ? (
          <div className="py-5">{renderSkeleton()}</div>
        ) : (
          <>
            <Row xs={1} md={2} lg={3} className="g-4">
              {events
                .filter(event => {
                  const searchText = search.toLowerCase();
                  const match =
                    event.title?.toLowerCase().includes(searchText) ||
                    event.location?.toLowerCase().includes(searchText);
                  if (filter === 'upcoming' && !isUpcoming(event.event_date)) return false;
                  if (filter === 'past' && isUpcoming(event.event_date)) return false;
                  return match;
                })
                .map((event) => (
                  <Col key={event.id}>
                    <Card className="h-100 shadow event-card border-0 position-relative" style={{
                      borderRadius: 24,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #f0f9ff 60%, #e0e7ff 100%)',
                      boxShadow: '0 4px 32px #e0e7ff',
                      border: 'none',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      cursor: 'pointer'
                    }} onClick={() => openModal(event)}>
                      <div style={{ position: 'relative' }}>
                        <Card.Img
                          variant="top"
                          src={event.image_url ? `http://localhost:5000${event.image_url}` : '/event-default.jpg'}
                          style={{
                            height: 200,
                            objectFit: 'cover',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            borderBottom: '1.5px solid #e0e7ff',
                            filter: 'brightness(0.97)'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/event-default.jpg';
                          }}
                        />
                        <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', gap: 8 }}>
                          {isUpcoming(event.event_date) ? (
                            <Badge bg="primary" style={{ fontSize: 15, padding: '7px 18px', borderRadius: 16, boxShadow: '0 2px 8px rgba(44, 62, 80, 0.10)', letterSpacing: 1 }}>
                              <i className="fas fa-bolt me-1"></i>กำลังจะมาถึง
                            </Badge>
                          ) : (
                            <Badge bg="secondary" style={{ fontSize: 15, padding: '7px 18px', borderRadius: 16, boxShadow: '0 2px 8px rgba(44, 62, 80, 0.10)' }}>
                              <i className="fas fa-history me-1"></i>กิจกรรมที่ผ่านมา
                            </Badge>
                          )}
                          {event.category && (
                            <Badge bg="warning" text="dark" style={{ fontSize: 14, padding: '7px 14px', borderRadius: 14 }}>{event.category}</Badge>
                          )}
                        </div>
                        <Button variant="light" size="sm" style={{ position: 'absolute', top: 18, right: 18, borderRadius: 50, boxShadow: '0 2px 8px #e0e7ff', zIndex: 2 }} onClick={e => { e.stopPropagation(); handleShare(event); }}>
                          <i className="fas fa-share-alt text-primary"></i>
                        </Button>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fw-bold" style={{ fontSize: 22, color: '#2563eb', marginBottom: 8 }}>
                          <i className="fas fa-calendar-alt me-2" style={{ color: '#facc15' }}></i>{event.title}
                        </Card.Title>
                        <div className="mb-2 text-muted" style={{ fontSize: 15 }}>
                          <i className="far fa-calendar me-2"></i>
                          {formatDate(event.event_date)}
                          <span className="mx-2">|</span>
                          <i className="far fa-clock me-2"></i>
                          {formatTime(event.event_date) || '--'}
                        </div>
                        <div className="mb-2 text-muted" style={{ fontSize: 15 }}>
                          <i className="fas fa-map-marker-alt me-2"></i>
                          {event.location}
                        </div>
                        <Card.Text className="mb-3" style={{
                          minHeight: 60,
                          color: '#334155',
                          fontSize: 16,
                          borderLeft: '3px solid #2563eb',
                          paddingLeft: 12,
                          background: 'linear-gradient(90deg, #f8fafc 80%, #e0e7ff 100%)',
                          borderRadius: 8,
                          boxShadow: '0 1px 4px #e0e7ff44'
                        }}>
                          {event.description?.length > 120
                            ? event.description.substring(0, 120) + '...'
                            : event.description}
                        </Card.Text>
                        <div className="mt-auto d-flex align-items-center justify-content-between">
                          <span style={{ fontSize: 15, color: '#64748b' }}><i className="fas fa-users me-1"></i>{event.participants_count || 0} คนเข้าร่วม</span>
                          <Button
                            variant="outline-primary"
                            className="fw-bold"
                            style={{ borderRadius: 10, fontSize: 15, borderWidth: 2, letterSpacing: 0.5, minWidth: 120 }}
                            onClick={e => { e.stopPropagation(); openModal(event); }}
                          >
                            <i className="fas fa-eye me-1"></i>ดูรายละเอียด
                          </Button>
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-muted bg-white border-0" style={{ fontSize: 14, borderTop: '1.5px solid #e0e7ff' }}>
                        <i className="fas fa-user me-2"></i>
                        {event.organizer || 'ฝ่ายกิจการศิษย์เก่า'}
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
            </Row>
            {/* Empty state for filtered results */}
            {events.filter(event => {
              const searchText = search.toLowerCase();
              const match =
                event.title?.toLowerCase().includes(searchText) ||
                event.location?.toLowerCase().includes(searchText);
              if (filter === 'upcoming' && !isUpcoming(event.event_date)) return false;
              if (filter === 'past' && isUpcoming(event.event_date)) return false;
              return match;
            }).length === 0 && !loading && !error && (
              <div className="text-center py-5">
                <img src="/event-default.jpg" alt="empty" style={{ width: 90, opacity: 0.5, marginBottom: 12 }} />
                <h4>ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</h4>
                <p className="text-muted">กรุณาลองเปลี่ยนคำค้นหาหรือเงื่อนไขใหม่</p>
              </div>
            )}
            {/* Modal for event detail */}
            <Modal show={showModal} onHide={closeModal} size="lg" centered>
              {selectedEvent && (
                <>
                  <Modal.Header closeButton style={{ background: '#f8fafc' }}>
                    <Modal.Title><i className="fas fa-calendar-alt me-2" style={{ color: '#facc15' }}></i>{selectedEvent.title}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{ background: '#f8fafc' }}>
                    <Row>
                      <Col md={5} className="mb-3 mb-md-0">
                        <img src={selectedEvent.image_url ? `http://localhost:5000${selectedEvent.image_url}` : '/event-default.jpg'} alt="event" style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 260 }} onError={e => { e.target.onerror = null; e.target.src = '/event-default.jpg'; }} />
                        <div className="mt-3">
                          <Badge bg={isUpcoming(selectedEvent.event_date) ? 'primary' : 'secondary'} className="me-2">
                            {isUpcoming(selectedEvent.event_date) ? 'กำลังจะมาถึง' : 'กิจกรรมที่ผ่านมา'}
                          </Badge>
                          {selectedEvent.category && <Badge bg="warning" text="dark">{selectedEvent.category}</Badge>}
                        </div>
                      </Col>
                      <Col md={7}>
                        <div className="mb-2"><i className="far fa-calendar me-2"></i>{formatDate(selectedEvent.event_date)} <span className="mx-2">|</span> <i className="far fa-clock me-2"></i>{formatTime(selectedEvent.event_date) || '--'}</div>
                        <div className="mb-2"><i className="fas fa-map-marker-alt me-2"></i>{selectedEvent.location}</div>
                        <div className="mb-2"><i className="fas fa-user me-2"></i>{selectedEvent.organizer || 'ฝ่ายกิจการศิษย์เก่า'}</div>
                        <div className="mb-2"><i className="fas fa-users me-2"></i>{selectedEvent.participants_count || 0} คนเข้าร่วม</div>
                        <div className="mb-3" style={{ color: '#334155', fontSize: 16 }}>{selectedEvent.description}</div>
                        {user && (
                          registeredEvents.includes(selectedEvent.id) ? (
                            <Button
                              variant="outline-danger"
                              className="fw-bold me-2"
                              style={{ borderRadius: 10, fontSize: 16, borderWidth: 2, letterSpacing: 0.5 }}
                              disabled={registering[selectedEvent.id]}
                              onClick={() => handleUnregister(selectedEvent.id)}
                            >
                              {registering[selectedEvent.id] ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-times me-1"></i>ยกเลิกลงทะเบียน</>}
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              className="fw-bold me-2"
                              style={{ borderRadius: 10, fontSize: 16, borderWidth: 2, letterSpacing: 0.5 }}
                              disabled={registering[selectedEvent.id]}
                              onClick={() => handleRegister(selectedEvent.id)}
                            >
                              {registering[selectedEvent.id] ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-check me-1"></i>ลงทะเบียนเข้าร่วมกิจกรรม</>}
                            </Button>
                          )
                        )}
                        <Button variant="outline-secondary" className="fw-bold" style={{ borderRadius: 10, fontSize: 16, borderWidth: 2, letterSpacing: 0.5 }} onClick={() => handleShare(selectedEvent)}>
                          <i className="fas fa-share-alt me-1"></i>แชร์กิจกรรม
                        </Button>
                      </Col>
                    </Row>
                  </Modal.Body>
                </>
              )}
            </Modal>
          </>
        )}
// ...existing code...
      </Container>
      <style>{`
        .event-card {
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .event-card:hover {
          box-shadow: 0 8px 32px rgba(37,99,235,0.13), 0 1.5px 6px rgba(44, 62, 80, 0.08);
          transform: translateY(-4px) scale(1.01);
        }
        .event-card .btn {
          transition: background 0.15s, color 0.15s, border 0.15s;
        }
        .event-card .btn-primary {
          background: linear-gradient(90deg, #2563eb 80%, #60a5fa 100%);
          border: none;
        }
        .event-card .btn-outline-primary {
          border-color: #2563eb;
        }
        .event-card .btn-outline-danger {
          border-color: #ef4444;
        }
        .skeleton-card {
          background: linear-gradient(90deg, #f1f5f9 60%, #e0e7ff 100%);
          animation: skeleton-loading 1.2s infinite linear alternate;
        }
        @keyframes skeleton-loading {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </BackgroundLayout>
  );
}

export default Events;
