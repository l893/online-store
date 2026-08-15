import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { selectAuthenticatedUser } from '../model/auth.slice';

interface RequireGuestProps {
  readonly children: ReactNode;
}

export const RequireGuest = ({ children }: RequireGuestProps) => {
  const authenticatedUser = useSelector(selectAuthenticatedUser);

  if (authenticatedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};
