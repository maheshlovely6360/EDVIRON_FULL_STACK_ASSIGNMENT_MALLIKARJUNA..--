import React from 'react';
import { Navigate } from 'react-router-dom';  // Import Navigate instead of Redirect

const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // Replace with actual authentication check

  if (!isAuthenticated) {
    return <Navigate to="/login" />;  // Use Navigate for redirecting
  }

  return children;  // Return the children (protected components) if authenticated
};

export default PrivateRoute;