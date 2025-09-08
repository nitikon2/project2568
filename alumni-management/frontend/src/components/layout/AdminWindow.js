import React from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import '../styles/AdminLayout.css';

function AdminWindow({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}

export default AdminWindow;
