
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = () => {
  const { isAdmin, loading, isFirstAccess, user } = useAuth();

  console.log("AdminRoute - isAdmin:", isAdmin, "loading:", loading, "isFirstAccess:", isFirstAccess, "user:", !!user);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  // Se é primeiro acesso, permitir acesso para criar o primeiro admin
  if (isFirstAccess) {
    console.log("First access allowed");
    return <Outlet />;
  }

  // Se está logado e é admin, permitir acesso
  if (user && isAdmin) {
    console.log("Admin access granted");
    return <Outlet />;
  }

  // Caso contrário, redirecionar para login
  console.log("Redirecting to login");
  return <Navigate to="/login" replace />;
};

export default AdminRoute;
