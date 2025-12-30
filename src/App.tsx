
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
const App = () => {
  // REMOVED AGGRESSIVE RELOAD LOGIC that forces loop in normal browser.
  // We trust the browser cache or user to Ctrl+F5.

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

              {/* PUBLIC POPUP ROUTE (Easier for OBS/vMix, no auth blocking) */}
              <Route path="/live-draw" element={<LiveDrawPage />} />

              {/* Admin routes with protected access */}
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<Admin />} />
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
