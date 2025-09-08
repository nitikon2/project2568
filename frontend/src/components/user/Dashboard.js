import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function UserDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Container className="py-4">
      <h2 className="mb-4">แดชบอร์ดผู้ใช้</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>ข้อมูลส่วนตัว</Card.Title>
              <Card.Text>
                <strong>ชื่อ:</strong> {user.name}<br />
                <strong>คณะ:</strong> {user.faculty}<br />
                <strong>สาขา:</strong> {user.major}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>กิจกรรมล่าสุด</Card.Title>
              <Card.Text>
                จำนวนโพสต์: <strong>0</strong><br />
                ความคิดเห็น: <strong>0</strong>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>การแจ้งเตือน</Card.Title>
              <Card.Text>
                คุณไม่มีการแจ้งเตือนใหม่
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserDashboard;
