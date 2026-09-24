import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/appRoutes";

// adminOnly: members get sent back to the dashboard
export const ProtectedRoute = ({ adminOnly = false }) => {
  const { token, user, isAdmin } = useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (adminOnly) {
    // wait for /auth/me before deciding on the role
    if (!user) return <p className="p-3">Loading...</p>;
    if (!isAdmin) return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
