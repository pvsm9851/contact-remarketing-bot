
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";
import { WhatsAppProvider } from "@/contexts/WhatsAppContext";

// Components
import RequireAuth from "@/components/RequireAuth";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WhatsAppConnect from "./pages/WhatsAppConnect";
import WhatsAppContacts from "./pages/WhatsAppContacts";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient instance for each render to avoid sharing instances
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WhatsAppProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route 
                  path="/login" 
                  element={
                    <RedirectIfAuthenticated>
                      <Login />
                    </RedirectIfAuthenticated>
                  } 
                />
                <Route 
                  path="/registro" 
                  element={
                    <RedirectIfAuthenticated>
                      <Register />
                    </RedirectIfAuthenticated>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/whatsapp" 
                  element={
                    <RequireAuth>
                      <WhatsAppConnect />
                    </RequireAuth>
                  } 
                />
                <Route 
                  path="/contatos" 
                  element={
                    <RequireAuth>
                      <WhatsAppContacts />
                    </RequireAuth>
                  } 
                />

                {/* API Mock Routes - These would normally be handled by a backend */}
                <Route 
                  path="/api/whatsapp-status" 
                  element={<div>{"{ status: \"connected\" }"}</div>}
                />

                {/* Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WhatsAppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
