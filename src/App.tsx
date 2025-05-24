import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";
import { WhatsAppProvider } from "@/contexts/WhatsAppContext";
import { StatsProvider } from "@/contexts/StatsContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

// Components
import RequireAuth from "@/components/RequireAuth";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";
import RequireWhatsAppConnection from "@/components/RequireWhatsAppConnection";
import PrivateRoute from "@/components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WhatsApp from "./pages/WhatsApp";
import Contacts from "./pages/Contacts";
import Plans from "./pages/Plans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <WhatsAppProvider>
              <StatsProvider>
                <TooltipProvider>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/login"
                      element={
                        <RedirectIfAuthenticated>
                          <Login />
                        </RedirectIfAuthenticated>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <RedirectIfAuthenticated>
                          <Register />
                        </RedirectIfAuthenticated>
                      }
                    />

                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/whatsapp"
                      element={
                        <PrivateRoute>
                          <WhatsApp />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/contatos"
                      element={
                        <PrivateRoute>
                          <RequireWhatsAppConnection>
                            <Contacts />
                          </RequireWhatsAppConnection>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/planos"
                      element={
                        <PrivateRoute>
                          <Plans />
                        </PrivateRoute>
                      }
                    />

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </StatsProvider>
            </WhatsAppProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
