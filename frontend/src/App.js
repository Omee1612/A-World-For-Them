import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AdoptionPage from './pages/AdoptionPage';
import AdoptionDetailPage from './pages/AdoptionDetailPage';
import PostAdoptionPage from './pages/PostAdoptionPage';
import VetCarePage from './pages/VetCarePage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <Router>
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/adopt" element={<AdoptionPage />} />
            <Route path="/adopt/:id" element={<AdoptionDetailPage />} />
            <Route path="/post-adoption" element={<ProtectedRoute><PostAdoptionPage /></ProtectedRoute>} />
            <Route path="/vet-care" element={<VetCarePage />} />
            <Route path="/chat/:roomId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '12px',
            background: '#2d2d2d',
            color: '#fff',
          },
          success: { iconTheme: { primary: '#3d6b4f', secondary: '#fff' } },
          error: { iconTheme: { primary: '#c4633a', secondary: '#fff' } },
        }}
      />
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
