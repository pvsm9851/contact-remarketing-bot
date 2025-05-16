
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const WhatsAppConnect = () => {
  const { session, isLoading, error, createSession, resetSession } = useWhatsApp();
  const navigate = useNavigate();
  
  // Auto-connect when page loads if no session exists
  useEffect(() => {
    const shouldAutoConnect = !session && !isLoading;
    if (shouldAutoConnect) {
      createSession();
    }
  }, []);

  // Check for connection status changes
  useEffect(() => {
    if (session?.connected) {
      // Navigate to contacts page when connected
      navigate("/contatos");
    }
  }, [session?.connected, navigate]);

  // Poll for webhook response
  useEffect(() => {
    let intervalId: number;
    
    if (session?.qrCode && !session.connected) {
      // Start polling for connection status via webhook
      intervalId = window.setInterval(async () => {
        try {
          const response = await fetch(`${window.location.origin}/api/whatsapp-status`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === "connected") {
              // Update local session status when webhook responds with connected
              if (session) {
                const updatedSession = {
                  ...session,
                  connected: true
                };
                localStorage.setItem(`whatsapp_session_${JSON.parse(localStorage.getItem('auth') || '{}')?.user?.id || 'unknown'}`, JSON.stringify(updatedSession));
                // Redirect to contacts page
                navigate('/contatos');
              }
            }
          }
        } catch (error) {
          console.error("Error checking webhook status:", error);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">WhatsApp</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              Conecte seu WhatsApp para enviar mensagens de remarketing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session?.connected ? (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">WhatsApp conectado</AlertTitle>
                <AlertDescription className="text-green-700">
                  Seu WhatsApp está conectado e pronto para enviar mensagens.
                </AlertDescription>
              </Alert>
            ) : session?.qrCode ? (
              <div className="text-center">
                <p className="mb-4 text-gray-700">
                  Escaneie o código QR abaixo com seu WhatsApp:
                </p>
                <div className="border bg-white p-4 inline-block mb-4">
                  <img 
                    src={session.qrCode} 
                    alt="QR Code para conectar WhatsApp" 
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Abra o WhatsApp no seu telefone → Menu (⋮) → WhatsApp Web → Escanear código QR
                </p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-700">
                  Gerando código QR...
                </p>
                <div className="w-64 h-64 mx-auto bg-gray-100 animate-pulse"></div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-700">
                  Você precisa conectar seu WhatsApp para poder enviar mensagens de remarketing.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {session?.connected ? (
              <div className="flex gap-4 w-full">
                <Button 
                  variant="destructive" 
                  onClick={resetSession}
                  className="flex-1"
                >
                  Desconectar WhatsApp
                </Button>
                <Button 
                  onClick={() => navigate("/contatos")}
                  className="flex-1"
                >
                  Gerenciar Contatos
                </Button>
              </div>
            ) : session?.qrCode ? (
              <Button 
                variant="outline" 
                onClick={resetSession}
                className="w-full"
              >
                Cancelar
              </Button>
            ) : (
              <Button 
                onClick={createSession} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Gerando código..." : "Conectar WhatsApp"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default WhatsAppConnect;
