
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminProtectedRoute = () => {
  const { isAdmin, loading, isFirstAccess, user, signOut } = useAuth();
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setIsTimeout(true);
      }, 10000); // 10s timeout
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (isTimeout) {
    console.error("Admin protection timeout - forcing logout");
    signOut(); // Force clear state
    return <Navigate to="/admin/login" replace />;
  }

  console.log("AdminProtectedRoute - isAdmin:", isAdmin, "loading:", loading, "isFirstAccess:", isFirstAccess, "user:", !!user);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-[#1d244a] to-[#2a3459] gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        <p className="text-white text-sm animate-pulse">Verificando acesso...</p>
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

  // Caso contrário, redirecionar para login administrativo
  console.log("Redirecting to admin login");
  return <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
