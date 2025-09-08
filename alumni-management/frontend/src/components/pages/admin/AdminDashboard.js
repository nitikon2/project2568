import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Container } from 'react-bootstrap';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
    totalNews: 0,
    recentUsers: [],
    verifiedUsers: 0,
    pendingUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Alumni stats
      const alumniStatsRes = await axios.get('http://localhost:5000/api/admin/alumni/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Posts stats
      const postsRes = await axios.get('http://localhost:5000/api/admin/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Events stats
      const eventsRes = await axios.get('http://localhost:5000/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // News stats
      const newsRes = await axios.get('http://localhost:5000/api/admin/news?stats=1', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Recent users
      const recentUsersRes = await axios.get('http://localhost:5000/api/admin/alumni', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats({
        totalUsers: alumniStatsRes.data.total,
        verifiedUsers: alumniStatsRes.data.verified,
        pendingUsers: alumniStatsRes.data.pending,
        totalPosts: postsRes.data.total,
        totalEvents: eventsRes.data.total,
        totalNews: newsRes.data.total,
        recentUsers: Array.isArray(recentUsersRes.data.alumni)
          ? recentUsersRes.data.alumni.slice(0, 5)
          : []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: th });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container fluid className="dashboard-bg p-0" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 60%, #e3f0ff 100%)'}}>
        <Row className="g-4 mb-4 px-3">
          {/* การ์ดสถิติ */}
          {[
            {
              label: 'ศิษย์เก่าทั้งหมด',
              value: stats.totalUsers,
              color: 'primary',
              icon: 'fas fa-user-graduate',
              textClass: 'text-primary',
              bgClass: 'bg-primary'
            },
            {
              label: 'กิจกรรมทั้งหมด',
              value: stats.totalEvents,
              color: 'info',
              icon: 'fas fa-calendar',
              textClass: 'text-info',
              bgClass: 'bg-info'
            },
            {
              label: 'ข่าวสารทั้งหมด',
              value: stats.totalNews,
              color: 'warning',
              icon: 'far fa-newspaper',
              textClass: 'text-warning',
              bgClass: 'bg-warning'
            },
            {
              label: 'กระดานสนทนา',
              value: stats.totalPosts,
              color: 'success',
              icon: 'fas fa-comments',
              textClass: 'text-success',
              bgClass: 'bg-success'
            }
          ].map((card, idx) => (
            <Col md={3} key={card.label}>
              <Card className="dashboard-stat-card dashboard-hover" style={{background: 'rgba(255,255,255,0.96)', border: 'none', minHeight: 120}}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">{card.label}</h6>
                      <h3 className={`mb-0 fw-bold ${card.textClass}`}>{card.value}</h3>
                    </div>
                    <div className={`stat-icon ${card.bgClass}`} style={{boxShadow: '0 2px 8px #e0e7ff', fontSize: 28, minWidth: 50, minHeight: 50}}>
                      <i className={card.icon}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row className="px-3">
          <Col>
            <Card className="dashboard-hover" style={{background: 'rgba(255,255,255,0.98)', borderRadius: 18, border: 'none', boxShadow: '0 2px 12px #e0e7ff'}}>
              <Card.Body>
                <h5 className="mb-4 fw-bold" style={{color: '#2563eb'}}>ศิษย์เก่าที่ลงทะเบียนล่าสุด</h5>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0" style={{borderRadius: 12, overflow: 'hidden'}}>
                    <thead style={{background: '#f4f7fb'}}>
                      <tr style={{fontWeight: 600, color: '#334155'}}>
                        <th></th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>คณะ</th>
                        <th>ปีที่จบ</th>
                        <th>อาชีพ</th>
                        <th>ตำแหน่งงาน</th>
                        <th>สถานที่ทำงาน</th>
                        <th>เงินเดือน</th>
                        <th>วันที่ลงทะเบียน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((user, idx) => (
                        <tr key={user.id} style={{background: idx % 2 === 0 ? '#f8fafc' : '#fff'}}>
                          <td>
                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{width:32, height:32, boxShadow: '0 1px 4px #e0e7ff'}}>
                              <i className="fas fa-user text-secondary"></i>
                            </div>
                          </td>
                          <td className="fw-semibold">{user.name}</td>
                          <td>{user.faculty}</td>
                          <td><Badge bg="secondary">{user.graduation_year}</Badge></td>
                          <td>{user.occupation || '-'}</td>
                          <td>{user.position || '-'}</td>
                          <td>{user.workplace || '-'}</td>
                          <td>{user.salary || '-'}</td>
                          <td>{formatDate(user.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
}

export default AdminDashboard;
