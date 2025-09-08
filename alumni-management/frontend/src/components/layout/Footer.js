import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <Container>
        <Row className="py-4">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-white mb-3">ติดต่อเรา</h5>
            <p className="mb-1">มหาวิทยาลัยราชภัฏมหาสารคาม</p>
            <p className="mb-1">80 ถนนนครสวรรค์ ตำบลตลาด</p>
            <p className="mb-1">อำเภอเมือง จังหวัดมหาสารคาม 44000</p>
            <p className="mb-1">โทร: 043-722-118</p>
            <p>อีเมล: alumni@rmu.ac.th</p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-white mb-3">ลิงก์ด่วน</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/news">ข่าวสาร</Link></li>
              <li className="mb-2"><Link to="/events">กิจกรรม</Link></li>
              <li className="mb-2"><Link to="/forum">พูดคุย</Link></li>
              <li className="mb-2"><Link to="/alumni">ทำเนียบศิษย์เก่า</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5 className="text-white mb-3">ติดตามเรา</h5>
            <div className="social-links">
                <a href="https://www.facebook.com/www.rmu.ac.th" target="_blank" rel="noopener noreferrer" className="me-3">
                  <i className="fab fa-facebook-f"></i>
                </a>
                {/* ลบ Youtube และ Twitter ออก เหลือเฉพาะ Facebook */}
            </div>
          </Col>
        </Row>
        <hr className="footer-divider" />
        <div className="text-center py-3">
          <p className="mb-0">&copy; {new Date().getFullYear()} ระบบศิษย์เก่า มหาวิทยาลัยราชภัฏมหาสารคาม. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
