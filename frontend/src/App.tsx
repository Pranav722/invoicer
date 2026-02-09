import React from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import Vendors from './pages/Vendors';
import Services from './pages/Services';
import Users from './pages/Users';
import Settings from './pages/Settings';
import TemplateSelector from './pages/TemplateSelector';
import TemplateEditor from './pages/TemplateEditor';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';


// Protected route component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="invoices" element={<ErrorBoundary><Invoices /></ErrorBoundary>} />
        <Route path="invoices/create" element={<ErrorBoundary><CreateInvoice /></ErrorBoundary>} />
        <Route path="invoices/:id" element={<ErrorBoundary><CreateInvoice /></ErrorBoundary>} />
        <Route path="vendors" element={<ErrorBoundary><Vendors /></ErrorBoundary>} />
        <Route path="services" element={<ErrorBoundary><Services /></ErrorBoundary>} />
        <Route path="users" element={<ErrorBoundary><Users /></ErrorBoundary>} />
        <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
        <Route path="templates" element={<ErrorBoundary><TemplateSelector /></ErrorBoundary>} />
        <Route path="templates/customize/:id" element={<ErrorBoundary><TemplateEditor /></ErrorBoundary>} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
