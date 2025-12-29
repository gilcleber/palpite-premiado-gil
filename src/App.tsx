
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import LiveDrawPage from "./pages/LiveDrawPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

// MECHANISM TO FORCE CACHE CLEANUP ON UPDATE
const APP_VERSION = '3.26-auto-clean';

const App = () => {
  // Check version and clear cache if mismatch
  const storedVersion = localStorage.getItem('app_version');
  if (storedVersion !== APP_VERSION) {
    console.log(`Detected new version (${APP_VERSION}). Clearing cache...`);
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('app_version', APP_VERSION);
    // Force reload to ensure clean state
    window.location.reload();
    return null; // Stop rendering
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/palpite-premiado-gil">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin routes with protected access */}
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/live-draw" element={<LiveDrawPage />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>

      </AuthProvider>
    </QueryClientProvider >
  );
};

export default App;
