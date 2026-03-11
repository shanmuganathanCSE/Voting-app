import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/Authcontext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PollsPage from './pages/PollsPage';
import PollDetailPage from './pages/PollDetailPage';
import CreatePollPage from './pages/CreatePollPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

const AppLayout = () => {
  const { user } = useAuth();
  return (
    <div className="page-layout">
      <div className="scanline" />
      {user && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/polls" element={<ProtectedRoute><PollsPage /></ProtectedRoute>} />
          <Route path="/polls/:id" element={<ProtectedRoute><PollDetailPage /></ProtectedRoute>} />
          <Route path="/create-poll" element={<ProtectedRoute><CreatePollPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

// ✅ AppLayout is INSIDE AuthProvider — this is the key
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0c1520',
              color: '#e8f4f8',
              border: '1px solid rgba(0,212,255,0.2)',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '15px',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#020408' } },
            error: { iconTheme: { primary: '#ff2d55', secondary: '#020408' } },
          }}
        />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}