import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
    totalNews: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, postsRes, eventsRes, newsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users'),
        axios.get('http://localhost:5000/api/admin/posts'),
        axios.get('http://localhost:5000/api/admin/events'),
        axios.get('http://localhost:5000/api/admin/news')
      ]);

      setStats({
        totalUsers: usersRes.data.total,
        totalPosts: postsRes.data.total,
        totalEvents: eventsRes.data.total,
        totalNews: newsRes.data.total,
        recentUsers: usersRes.data.recent
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">กำลังโหลด...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">แดชบอร์ดผู้ดูแลระบบ</h2>
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">ข่าวสารทั้งหมด</h6>
                  <h3 className="mb-0">{stats.totalNews || 0}</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <i className="far fa-newspaper fa-2x text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">กระดานสนทนา</h6>
                  <h3 className="mb-0">{stats.totalPosts}</h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="fas fa-comments fa-2x text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">ศิษย์เก่าที่ลงทะเบียนล่าสุด</h5>
                <Button variant="outline-primary" size="sm">ดูทั้งหมด</Button>
              </div>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ชื่อ-นามสกุล</th>
                    <th>คณะ</th>
                    <th>ปีที่จบ</th>
                    <th>สถานะ</th>
                    <th>วันที่ลงทะเบียน</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.faculty}</td>
                      <td>{user.graduation_year}</td>
                      <td>
                        <Badge bg="success">ยืนยันแล้ว</Badge>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
