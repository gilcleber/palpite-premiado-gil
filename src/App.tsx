
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
        </TooltipProvider >
      </AdminAuthProvider >
    </AuthProvider >
  </QueryClientProvider >
);

export default App;
