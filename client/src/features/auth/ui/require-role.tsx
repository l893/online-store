import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { selectAuthenticatedUser } from '../model/auth.slice';

interface RequireRoleProps {
  readonly role: string;
  readonly children: ReactNode;
}

export const RequireRole = ({ role, children }: RequireRoleProps) => {
  const authenticatedUser = useSelector(selectAuthenticatedUser);
  const roles = authenticatedUser?.roles ?? [];

  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
