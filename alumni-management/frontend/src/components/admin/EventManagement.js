import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button, Container, Modal, Badge, Accordion } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';

function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrationsMap, setRegistrationsMap] = useState({});

  useEffect(() => {
    fetchEventsAndRegistrations();
  }, []);

  const fetchEventsAndRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const eventsRes = await axios.get('http://localhost:5000/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      let eventList = [];
      if (Array.isArray(eventsRes.data)) {
        eventList = eventsRes.data;
      } else if (eventsRes.data && Array.isArray(eventsRes.data.events)) {
        eventList = eventsRes.data.events;
      }
      setEvents(eventList);

      // ดึงข้อมูลผู้ลงทะเบียนของทุกกิจกรรม
      const registrationsObj = {};
      await Promise.all(eventList.map(async (event) => {
        try {
          const regRes = await axios.get(`http://localhost:5000/api/events/${event.id}/registrations`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          registrationsObj[event.id] = Array.isArray(regRes.data) ? regRes.data : [];
        } catch {
          registrationsObj[event.id] = [];
        }
      }));
      setRegistrationsMap(registrationsObj);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'ไม่สามารถโหลดข้อมูลกิจกรรมได้'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">กิจกรรมและผู้ลงทะเบียน</h2>
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <Accordion defaultActiveKey={events.length > 0 ? String(events[0].id) : undefined}>
          {events.length === 0 ? (
            <div className="text-center text-muted py-4">ไม่พบกิจกรรม</div>
          ) : (
            events.map(event => (
              <Accordion.Item eventKey={String(event.id)} key={event.id}>
                <Accordion.Header>
                  <div className="d-flex align-items-center w-100">
                    <span className="fw-bold me-3">{event.title}</span>
                    <Badge bg={event.status === 'upcoming' ? 'success' : 'secondary'} className="me-2">
                      {event.status === 'upcoming' ? 'กำลังจะมาถึง' : 'ผ่านไปแล้ว'}
                    </Badge>
                    <span className="text-muted ms-auto">
                      {moment(event.event_date).locale('th').format('LLL')}
                    </span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-3">
                    <strong>รายละเอียด:</strong> {event.description}
                  </div>
                  <div className="mb-3">
                    <strong>สถานที่:</strong> {event.location}
                  </div>
                  {event.image_url && (
                    <div className="mb-3">
                      <img
                        src={`http://localhost:5000${event.image_url}`}
                        alt={event.title}
                        style={{ width: 200, height: 120, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </div>
                  )}
                  <div className="mb-2 fw-bold">
                    รายชื่อผู้ลงทะเบียน ({registrationsMap[event.id]?.length || 0} คน)
                  </div>
                  <Table responsive bordered size="sm">
                    <thead>
                      <tr>
                        <th>ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>อีเมล</th>
                        <th>คณะ</th>
                        <th>ปีที่จบ</th>
                        <th>วันที่ลงทะเบียน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrationsMap[event.id] && registrationsMap[event.id].length > 0 ? (
                        registrationsMap[event.id].map((reg, idx) => (
                          <tr key={reg.id}>
                            <td>{idx + 1}</td>
                            <td>{reg.name}</td>
                            <td>{reg.email}</td>
                            <td>{reg.faculty}</td>
                            <td>{reg.graduation_year}</td>
                            <td>{new Date(reg.registered_at).toLocaleString('th-TH')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-3">
                            ยังไม่มีผู้ลงทะเบียน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            ))
          )}
        </Accordion>
      )}
    </Container>
  );
}

export default EventManagement;