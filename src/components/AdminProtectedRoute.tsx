import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  // Verifica se existe uma sessão administrativa ativa no localStorage
  const isAdminAuthenticated = localStorage.getItem('spygram_admin_auth') === 'true';

  if (!isAdminAuthenticated) {
    // Redireciona para o login exclusivo do admin
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;