import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { selectAuthenticatedUser } from '../model/auth.slice';

interface RequireAuthProps {
  readonly children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const user = useSelector(selectAuthenticatedUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
