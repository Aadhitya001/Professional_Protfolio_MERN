import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Portfolio from './pages/Portfolio';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DocumentViewer from './pages/DocumentViewer';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/docs/:token" element={<DocumentViewer />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function RequireAdmin({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Only allow admin users
  if (!user.isAdmin) return <div style={{ padding: '2rem' }}>🚫 You are not authorized to view this page.</div>;
  return children;
}
