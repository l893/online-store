import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const RequireRole = ({ role, children }) => {
  const roles = useSelector((s) => s.auth.user?.roles || []);

  if (!roles.includes(role)) return <Navigate to="/" replace />;

  return children;
};
