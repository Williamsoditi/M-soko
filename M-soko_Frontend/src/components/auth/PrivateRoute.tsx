import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  element: React.FC;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element: Component }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optionally, you can return a loading spinner here
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;