import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';

// Pages
import Home from './components/pages/Home';
import News from './components/pages/News';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import Profile from './components/pages/Profile';
import Forum from './components/pages/Forum';
import AlumniDirectory from './components/pages/AlumniDirectory';

import ForgotPassword from './components/pages/ForgotPassword';

// Admin Components
import AdminDashboard from './components/pages/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import NewsManagement from './components/admin/NewsManagement';
import EventManagement from './components/admin/EventManagement';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          } />
          <Route path="/alumni" element={
            <ProtectedRoute>
              <AlumniDirectory />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/news" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <NewsManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EventManagement />
            </ProtectedRoute>
          } />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
