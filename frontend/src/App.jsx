import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ModernLayout from './components/layout/ModernLayout';
import InactivityWarning from './components/InactivityWarning';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import ModernDashboard from './pages/dashboard/ModernDashboard';

// CRUD Pages
import Vehicles from './pages/vehicles/Vehicles';
import Drivers from './pages/drivers/Drivers';
import Customers from './pages/customers/Customers';
import Trips from './pages/trips/Trips';
import Sales from './pages/sales/Sales';
import UsersPage from './pages/users/Users';
import Companies from './pages/companies/Companies';
import Profile from './pages/profile/Profile';
import ChangePassword from './pages/profile/ChangePassword';
import Settings from './pages/settings/Settings';
import Notifications from './pages/notifications/Notifications';

// Placeholder component for bookings

const Bookings = () => (
  <div className="bg-white rounded-lg shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Reservas</h2>
    <p className="text-gray-600">Página de gestão de reservas em desenvolvimento...</p>
  </div>
);

// Componente de aviso de inatividade com acesso ao contexto de autenticação
const InactivityWarningWithAuth = () => {
  const { logout } = useAuth();
  return <InactivityWarning onLogout={logout} />;
};

// Componente interno para usar hooks
const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <ModernLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ModernDashboard />} />
            
            {/* Master only routes */}
            <Route path="companies" element={
              <ProtectedRoute requireRoles={["master"]}>
                <Companies />
              </ProtectedRoute>
            } />
            
            {/* Admin and Master routes */}
            <Route path="users" element={
              <ProtectedRoute requireRoles={["admin", "master"]}>
                <UsersPage />
              </ProtectedRoute>
            } />
            
            {/* All authenticated users */}
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="trips" element={<Trips />} />
            <Route path="sales" element={<Sales />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Componente de aviso de inatividade com acesso ao contexto */}
        <InactivityWarningWithAuth />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
