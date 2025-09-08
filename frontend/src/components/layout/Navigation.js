import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

function Navigation() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 py-2">
      <Container fluid="lg">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            width="80"
            height="80"
            className="d-inline-block"
            alt="Logo"
          />
          <span className="ms-3">ระบบศิษย์เก่า มรม.</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/news">ข่าวสาร</Nav.Link>
            <Nav.Link as={Link} to="/events">กิจกรรม</Nav.Link>
            <Nav.Link as={Link} to="/forum">พูดคุย</Nav.Link>
            <Nav.Link as={Link} to="/alumni">ทำเนียบศิษย์เก่า</Nav.Link>
            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/admin/users">จัดการข้อมูลสมาชิก</Nav.Link>
                <Nav.Link as={Link} to="/admin/news">จัดการข้อมูลข่าวสาร</Nav.Link>
                <Nav.Link as={Link} to="/admin/events">จัดการข้อมูลกิจกรรม</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="d-flex align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className="me-2">โปรไฟล์</Nav.Link>
                <Button 
                  variant="light" 
                  onClick={handleLogout}
                  className="fw-500 px-4"
                >
                  ออกจากระบบ
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">เข้าสู่ระบบ</Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="light"
                  className="fw-500 px-4"
                >
                  สมัครสมาชิก
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;