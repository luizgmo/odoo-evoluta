/**
 * Rota protegida: exige sessão (e, se pedido, perfil).
 * Sem sessão vai para /login (guardando de onde veio); sem perfil, para /unauthorized.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Os perfis vêm de um lugar só: o tipo `Perfil` de AuthContext. */
  requiredRole?: Perfil;
  allowedRoles?: Perfil[];
  redirectTo?: string;
}

/**
 * Protected Route Component with Role-Based Access Control
 * 
 * @param children - Components to render if authorized
 * @param requiredRole - Specific role required (exact match)
 * @param allowedRoles - Array of roles that have access
 * @param redirectTo - Custom redirect path (defaults to /login or /unauthorized)
 * 
 * @example
 * // Master only
 * <ProtectedRoute requiredRole="master">
 *   <MasterDashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Admin or Master
 * <ProtectedRoute allowedRoles={["master", "admin"]}>
 *   <ClientAdmin />
 * </ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Verificando autenticação…</p>
        </div>
      </div>
    );
  }
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // A tela de origem vai no state: o Login volta para ela
    return <Navigate to={redirectTo || "/login"} state={{ from: location }} replace />;
  }
  // Check role-based access
  const userRole: Perfil = user.role;
  // If specific role is required, check exact match
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`Access denied: User role "${userRole}" does not match required role "${requiredRole}"`);
    return <Navigate to="/unauthorized" replace />;
  }
  // If allowed roles are specified, check if user role is in the list
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`Access denied: User role "${userRole}" not in allowed roles: ${allowedRoles.join(", ")}`);
    return <Navigate to="/unauthorized" replace />;
  }
  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
