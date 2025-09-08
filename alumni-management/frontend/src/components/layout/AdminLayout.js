import React from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import '../../styles/AdminLayout.css';
import { Container } from 'react-bootstrap';

function AdminLayout({ children, title }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <Container fluid>
            <h2 className="mb-0">{title || 'จัดการระบบ'}</h2>
          </Container>
        </div>
        <Container fluid className="py-4">
          {children}
        </Container>
      </div>
    </div>
  );
}

export default AdminLayout;
