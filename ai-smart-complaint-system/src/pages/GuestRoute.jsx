import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const GuestRoute = () => {
  // Check if a user token exists in storage
  const isAuthenticated = !!localStorage.getItem('token'); 

  // If already logged in, redirect them straight to home
  // "replace" prevents them from hitting the back button to return to login
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // If not logged in, render the login/signup page normally
  return <Outlet />;
};

export default GuestRoute;