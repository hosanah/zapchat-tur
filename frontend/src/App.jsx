import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ModernLayout from './components/layout/ModernLayout';

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
import Events from './pages/events/Events';
import Sales from './pages/sales/Sales';

// Placeholder components for other pages
const Companies = () => (
  <div className="bg-white rounded-lg shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Empresas</h2>
    <p className="text-gray-600">Página de gestão de empresas em desenvolvimento...</p>
  </div>
);

const Users = () => (
  <div className="bg-white rounded-lg shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuários</h2>
    <p className="text-gray-600">Página de gestão de usuários em desenvolvimento...</p>
  </div>
);

const Bookings = () => (
  <div className="bg-white rounded-lg shadow-card p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Reservas</h2>
    <p className="text-gray-600">Página de gestão de reservas em desenvolvimento...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
                  <ProtectedRoute requiredRole="master">
                    <Companies />
                  </ProtectedRoute>
                } />
                
                {/* Admin and Master routes */}
                <Route path="users" element={
                  <ProtectedRoute requiredRole={["admin", "master"]}>
                    <Users />
                  </ProtectedRoute>
                } />
                
                {/* All authenticated users */}
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="customers" element={<Customers />} />
                <Route path="trips" element={<Trips />} />
                <Route path="events" element={<Events />} />
                <Route path="sales" element={<Sales />} />
                <Route path="bookings" element={<Bookings />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

