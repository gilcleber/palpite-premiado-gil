
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import LiveDrawPage from "./pages/LiveDrawPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

// MECHANISM TO FORCE CACHE CLEANUP ON UPDATE
const App = () => {
  // REMOVED AGGRESSIVE RELOAD LOGIC that forces loop in normal browser.
  // We trust the browser cache or user to Ctrl+F5.

  // TRIGGER DEPLOY 
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Specific routes FIRST (before dynamic tenant routes) */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/super" element={<SuperAdminLogin />} />
                <Route path="/live-draw" element={<LiveDrawPage />} />

                {/* Admin routes with protected access */}
                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/super-admin" element={<SuperAdmin />} />
                </Route>

                {/* Tenant-specific routes (LAST - catch-all patterns) */}
                <Route path="/:tenantSlug" element={<Index />} />
                <Route path="/:tenantSlug/:gameSlug" element={<Index />} />
                <Route path="/:tenantSlug/admin" element={<Admin />} />

                {/* 404 - Must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>

        </AuthProvider>
      </TenantProvider>
    </QueryClientProvider >
  );
};

export default App;
