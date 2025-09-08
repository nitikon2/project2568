import React, { useEffect, useState } from 'react';
import BackgroundLayout from '../layout/BackgroundLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/th';
import Swal from 'sweetalert2';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
    if (user) checkRegistered();
    // eslint-disable-next-line
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError('ไม่พบข้อมูลกิจกรรมนี้');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistered = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/users/${user.id}/event-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistered(res.data.some(r => r.event_id === Number(id)));
    } catch {
      setRegistered(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${id}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('สำเร็จ', 'ลงทะเบียนกิจกรรมเรียบร้อย', 'success');
      setRegistered(true);
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถลงทะเบียนได้', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${id}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('สำเร็จ', 'ยกเลิกการลงทะเบียนเรียบร้อย', 'success');
      setRegistered(false);
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถยกเลิกลงทะเบียนได้', 'error');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <BackgroundLayout>
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
        </Container>
      </BackgroundLayout>
    );
  }

  if (error || !event) {
    return (
      <BackgroundLayout>
        <Container className="py-5 text-center">
          <Alert variant="danger">{error || 'ไม่พบข้อมูลกิจกรรม'}</Alert>
          <Button variant="primary" onClick={() => navigate('/events')}>กลับหน้ากิจกรรม</Button>
        </Container>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout>
      <Container className="py-5">
        <Card className="mx-auto shadow-sm" style={{ maxWidth: 700 }}>
          {event.image_url && (
            <Card.Img
              variant="top"
              src={`http://localhost:5000${event.image_url}`}
              style={{ maxHeight: 350, objectFit: 'cover' }}
              onError={e => { e.target.onerror = null; e.target.src = '/event-default.jpg'; }}
            />
          )}
          <Card.Body>
            <h3 className="mb-3">{event.title}</h3>
            <div className="mb-2">
              <Badge bg={moment(event.event_date).isAfter() ? 'success' : 'secondary'}>
                {moment(event.event_date).isAfter() ? 'กำลังจะมาถึง' : 'ผ่านไปแล้ว'}
              </Badge>
            </div>
            <div className="mb-2 text-muted">
              <i className="far fa-calendar me-2"></i>
              {moment(event.event_date).locale('th').format('LLL')}
            </div>
            <div className="mb-2 text-muted">
              <i className="fas fa-map-marker-alt me-2"></i>
              {event.location}
            </div>
            <div className="mb-4">
              <strong>รายละเอียดกิจกรรม:</strong>
              <div className="mt-2">{event.description}</div>
            </div>
            {user && (
              registered ? (
                <Button
                  variant="danger"
                  className="w-100"
                  disabled={registering}
                  onClick={handleUnregister}
                >
                  {registering ? "กำลังยกเลิก..." : "ยกเลิกลงทะเบียน"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={registering}
                  onClick={handleRegister}
                >
                  {registering ? "กำลังลงทะเบียน..." : "ลงทะเบียนเข้าร่วมกิจกรรม"}
                </Button>
              )
            )}
          </Card.Body>
          <Card.Footer className="text-muted">
            <small>
              <i className="fas fa-user me-2"></i>
              ผู้จัดกิจกรรมศิษย์เก่า
            </small>
          </Card.Footer>
        </Card>
      </Container>
    </BackgroundLayout>
  );
}

export default EventDetail;
