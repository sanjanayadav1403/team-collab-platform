import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import JoinOrgPage from './pages/JoinOrgPage';
import ChatPage from './pages/ChatPage';
import TasksPage from './pages/TasksPage';
import FilesPage from './pages/FilesPage';
import AIAssistantPage from './pages/AiAssistantPage';

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  // On app load — check localStorage for existing tokens
  // This keeps user logged in after page refresh
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join" element={<JoinOrgPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          } 
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />

        {/* 404 fallback */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;