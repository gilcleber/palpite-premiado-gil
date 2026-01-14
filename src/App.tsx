
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
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
            <HashRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/game/:matchId" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/super" element={<SuperAdminLogin />} />

                {/* PUBLIC POPUP ROUTE (Easier for OBS/vMix, no auth blocking) */}
                <Route path="/live-draw" element={<LiveDrawPage />} />

                {/* Admin routes with protected access */}
                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/super-admin" element={<SuperAdmin />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </TooltipProvider>

        </AuthProvider>
      </TenantProvider>
    </QueryClientProvider >
  );
};

export default App;
