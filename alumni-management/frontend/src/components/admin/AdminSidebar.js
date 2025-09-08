import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: 'fas fa-tachometer-alt', text: 'แดชบอร์ด' },
    { path: '/admin/alumni', icon: 'fas fa-user-graduate', text: 'จัดการศิษย์เก่า' },
    { path: '/admin/posts', icon: 'fas fa-comments', text: 'จัดการกระดานสนทนา' },
    { path: '/admin/news', icon: 'fas fa-newspaper', text: 'จัดการข่าวสาร' },
    { path: '/admin/events', icon: 'fas fa-calendar-alt', text: 'จัดการกิจกรรม' }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <i className="fas fa-university"></i>
        <span>ระบบจัดการศิษย์เก่า</span>
      </div>
      
      <div className="admin-user-info">
        <div className="user-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="user-details">
          <h6 className="mb-0">ผู้ดูแลระบบ</h6>
          <small>Admin</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={`${item.icon} me-2`}></i>
            {item.text}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AdminSidebar;