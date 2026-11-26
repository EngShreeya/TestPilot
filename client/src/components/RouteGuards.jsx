import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { FullScreenLoader } from "./BrandUI";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader label="Restoring secure session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader label="Checking authentication..." />;
  }

  if (isAuthenticated) {
    const target = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

