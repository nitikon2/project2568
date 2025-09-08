import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import setupAxiosInterceptors from './utils/axiosSetup';

// Pages
import Home from './components/pages/Home';
import News from './components/pages/News';
import Events from './components/pages/Events';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import Profile from './components/pages/Profile';
import Forum from './components/pages/Forum';
import AlumniDirectory from './components/pages/AlumniDirectory';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import PostManagement from './components/admin/PostManagement';
import EventManagement from './components/admin/EventManagement';
import ManageAlumni from './components/pages/admin/ManageAlumni';
import ManageEvents from './components/pages/admin/ManageEvents';
import ManageNews from './components/pages/admin/ManageNews';
import ManagePosts from './components/pages/admin/ManagePosts';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import EventDetail from './components/pages/EventDetail';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

setupAxiosInterceptors();

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/events" element={<Events />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/events/:id" element={<EventDetail />} />

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
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/posts" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManagePosts />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageEvents />
            </ProtectedRoute>
          } />
          <Route path="/admin/alumni" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageAlumni />
            </ProtectedRoute>
          } />
          <Route path="/admin/news" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageNews />
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