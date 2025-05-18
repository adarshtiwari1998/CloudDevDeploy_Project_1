import React, { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { AuthService } from '../lib/auth-service';
import { useIsAuthenticated } from '@azure/msal-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Component
 * 
 * Redirects to login page if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}