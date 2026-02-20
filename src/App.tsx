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
import { DiagnosticsPage } from "./pages/Diagnostics";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { API_URL } from "@/lib/api";

const queryClient = new QueryClient();

// Warm up the server on page load (Vercel serverless functions can cold start)
function useServerWarmup() {
  useEffect(() => {
    // Warm up the API with a lightweight ping request
    // This helps reduce cold start delays for subsequent requests
    const warmup = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for warmup
        
        await fetch(`${API_URL}/ping`, {
          method: 'GET',
          signal: controller.signal,
        }).catch(() => {
          // Silent fail — just waking up the server
          console.log('Server warmup initiated');
        });
        
        clearTimeout(timeoutId);
      } catch (error) {
        // Ignore warmup errors
        console.log('Server warmup completed (may take time on cold start)');
      }
    };
    
    warmup();
  }, []);
}

const App = () => {
  useServerWarmup();

  return (
    <ErrorBoundary>
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
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
