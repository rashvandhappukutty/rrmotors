import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { BikeDetail } from "./pages/BikeDetail";
import { FinancePage } from "./pages/Finance";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { API_URL } from "@/lib/api";

const queryClient = new QueryClient();

// Warm up the server on page load (Render free tier spins down after inactivity)
function useServerWarmup() {
  useEffect(() => {
    fetch(`${API_URL}/ping`).catch(() => {
      // Silent fail — just waking up the server
    });
  }, []);
}

const App = () => {
  useServerWarmup();

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/bike/:id" element={<BikeDetail isAdminView={false} />} />
          <Route path="/bike/second-hand/:id" element={<BikeDetail isSecondHand={true} isAdminView={false} />} />
          <Route 
            path="/admin/bike/:id" 
            element={
              <ProtectedRoute>
                <BikeDetail isAdminView={true} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
