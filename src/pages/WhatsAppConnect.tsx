
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import ContextDebug from "@/components/ContextDebug";

const WhatsAppConnect = () => {
  const { session, isLoading, error, generateQRCode, checkConnection } = useWhatsApp();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.connected) {
      navigate("/chats");
    } else if (session?.qrCode) {
      setQrCode(session.qrCode);
    }
  }, [session, navigate]);

  const handleGenerateQRCode = async () => {
    // Clear existing QR code while loading
    if (qrCode) {
      setQrCode(null);
    }
    
    const code = await generateQRCode();
    if (code) {
      setQrCode(code);
      toast("QR Code gerado", {
        description: "Escaneie o código com seu WhatsApp para conectar."
      });
    } else {
      toast("Erro ao gerar QR Code", {
        description: "Ocorreu um erro ao tentar gerar o QR Code. Tente novamente."
      });
    }
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    try {
      const isConnected = await checkConnection();
      if (isConnected) {
        navigate("/chats");
      } else {
        toast("WhatsApp não conectado", {
          description: "Escaneie o QR Code novamente com seu WhatsApp."
        });
      }
    } finally {
      setCheckingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Conecte seu WhatsApp</h1>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conectar WhatsApp</CardTitle>
              <CardDescription>
                Escaneie o QR Code com seu WhatsApp para conectar sua conta
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {qrCode ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="border border-gray-300 p-4 rounded-md">
                    <img 
                      src={qrCode} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Abra o WhatsApp no seu celular, vá em Menu ou Configurações e toque em WhatsApp Web
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <p className="text-center text-gray-600">
                    Clique no botão abaixo para gerar um QR Code
                  </p>
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={handleGenerateQRCode}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Gerando..." : qrCode ? "Gerar Novo QR Code" : "Gerar QR Code"}
              </Button>
              
              {qrCode && (
                <Button 
                  onClick={handleCheckConnection}
                  disabled={checkingConnection}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {checkingConnection ? "Verificando..." : "Validar Conexão"}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Para usar o WhatsReMKT, é necessário conectar sua conta do WhatsApp.<br />
              Não se preocupe, não temos acesso às suas mensagens pessoais.
            </p>
          </div>
        </div>
      </main>
      
      {process.env.NODE_ENV === 'development' && <ContextDebug />}
    </div>
  );
};

export default WhatsAppConnect;
