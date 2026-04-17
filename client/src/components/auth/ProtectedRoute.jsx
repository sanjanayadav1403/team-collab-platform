import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute
 * Wraps private pages. Redirects to /login if user is not authenticated.
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;