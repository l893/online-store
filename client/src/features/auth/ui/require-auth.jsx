import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
