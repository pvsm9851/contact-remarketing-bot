
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CustomHeader } from "@/components/CustomHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Loader2, QrCode, RefreshCw, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const WhatsAppConnect: React.FC = () => {
  const { session, isLoading, error, generateQRCode, checkConnection } = useWhatsApp();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // Generate QR code on initial load if not connected
  useEffect(() => {
    if (!session?.connected && !session?.qrCode) {
      handleGenerateQRCode();
    }
  }, []);
  
  // Status check - called periodically and on component mount
  const checkConnectionStatus = useCallback(async () => {
    if (!session) return;
    
    setCheckingStatus(true);
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        toast.success("WhatsApp conectado!", {
          description: "Seu WhatsApp está conectado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Failed to check connection:", error);
    } finally {
      setCheckingStatus(false);
    }
  }, [session, checkConnection]);
  
  // Set up periodic checking
  useEffect(() => {
    if (!session?.connected) {
      // Check connection status immediately
      checkConnectionStatus();
      
      // Then check every 10 seconds
      const interval = setInterval(checkConnectionStatus, 10000);
      
      return () => clearInterval(interval);
    }
  }, [session, checkConnectionStatus]);
  
  const handleGenerateQRCode = async () => {
    await generateQRCode();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <CustomHeader />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Conectar WhatsApp</h1>
          <p className="text-gray-400 mt-2">
            Escaneie o QR code para conectar sua conta do WhatsApp
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Código QR</CardTitle>
              <CardDescription className="text-gray-400">
                Use o aplicativo WhatsApp em seu celular para escanear
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
                  <p className="mt-4 text-gray-400">Gerando código QR...</p>
                </div>
              ) : session?.connected ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <p className="mt-4 text-gray-200 text-center font-medium">WhatsApp conectado!</p>
                </div>
              ) : session?.qrCode ? (
                <div className="p-4 bg-white rounded-lg">
                  <img 
                    src={session.qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-full max-w-[240px] h-auto" 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <QrCode className="h-16 w-16 text-gray-500" />
                  <p className="mt-4 text-gray-400 text-center">
                    Clique abaixo para gerar um código QR
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              {!session?.connected && (
                <Button
                  onClick={handleGenerateQRCode}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      Gerando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" /> 
                      {session?.qrCode ? "Atualizar QR" : "Gerar QR"}
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={checkConnectionStatus}
                disabled={checkingStatus || isLoading}
                variant="outline"
                className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-700"
              >
                {checkingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" /> 
                    Verificar Status
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Instructions Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Como conectar</CardTitle>
              <CardDescription className="text-gray-400">
                Siga as instruções abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <ol className="space-y-4 text-gray-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                    1
                  </span>
                  <div>
                    <p>Abra o WhatsApp no seu celular</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Certifique-se de estar usando a conta que deseja conectar
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                    2
                  </span>
                  <div>
                    <p>Toque em Menu (•••) ou Configurações</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Acesse as configurações do seu WhatsApp
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                    3
                  </span>
                  <div>
                    <p>Selecione "Dispositivos Conectados"</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Essa opção permite vincular novos dispositivos
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                    4
                  </span>
                  <div>
                    <p>Aponte a câmera para o código QR</p>
                    <p className="text-sm text-gray-400 mt-1">
                      O código será escaneado automaticamente
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
            <CardFooter className="flex justify-end">
              {session?.connected && (
                <Button 
                  onClick={() => navigate("/contatos")}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Gerenciar Contatos
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-900/40 border border-red-700 rounded-lg">
            <p className="text-red-300">Erro: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConnect;
