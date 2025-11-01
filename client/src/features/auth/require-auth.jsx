import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }) => {
  const user = useSelector((s) => s.auth.user);
  const loc = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;

  return children;
};
