import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin routes
  if (allowedRoles.includes('admin') && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
