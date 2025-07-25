import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  exp: number;
  sub: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo,
}) => {
  const token = localStorage.getItem("jwtToken");

  // Check if user is authenticated
  const isAuthenticated = !!token;
  let userRole: string | null = null;

  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        // Token expired, clear storage
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("paymentUserId");
        return <Navigate to="/login" replace />;
      }

      userRole = decodedToken.role;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Invalid token, clear storage
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("paymentUserId");
      return <Navigate to="/login" replace />;
    }
  }

  // If requireAuth is false (guest only), redirect authenticated users
  if (!requireAuth && isAuthenticated) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Default redirect based on role
    switch (userRole) {
      case "Freelancer":
        return <Navigate to="/find-work" replace />;
      case "Client":
        return <Navigate to="/hirefreelancer" replace />;
      case "Admin":
        return <Navigate to="/admin/transactions" replace />;
      default:
        return <Navigate to="/find-work" replace />;
    }
  }

  // If requireAuth is true but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check user role
  if (
    allowedRoles.length > 0 &&
    (!userRole || !allowedRoles.includes(userRole))
  ) {
    // User doesn't have required role
    switch (userRole) {
      case "Freelancer":
        return <Navigate to="/find-work" replace />;
      case "Client":
        return <Navigate to="/hirefreelancer" replace />;
      case "Admin":
        return <Navigate to="/admin/transactions" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;
