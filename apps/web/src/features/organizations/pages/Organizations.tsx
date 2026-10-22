import { Navigate, useLocation } from 'react-router';

export const Organizations = () => {
  const location = useLocation();

  return <Navigate to="/dashboard" replace state={location.state} />;
};
