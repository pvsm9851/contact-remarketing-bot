import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomHeader } from "@/components/CustomHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, QrCode, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useWhatsApp } from "@/contexts/WhatsAppContext";

const WhatsAppConnect = () => {
  const { session, generateQRCode, checkConnection, disconnectSession, isLoading, error } = useWhatsApp();
  const [showQrCode, setShowQrCode] = useState(false);
  const navigate = useNavigate();

  // Check connection status periodically when connected
  useEffect(() => {
    if (session?.connected) {
      // If already connected, redirect to contacts page
      toast.success("WhatsApp conectado", {
        description: "Seu WhatsApp está conectado!"
      });
      navigate("/contatos");
    }
  }, [session, navigate]);

  const handleGenerateQRCode = async () => {
    setShowQrCode(true);
    const qrCode = await generateQRCode();
    if (!qrCode) {
      toast.error("Erro ao gerar QR Code", {
        description: "Tente novamente mais tarde."
      });
    }
  };

  const handleCheckConnection = async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      navigate("/contatos");
    }
  };

  const handleDisconnect = () => {
    disconnectSession();
    setShowQrCode(false);
    toast("WhatsApp desconectado", {
      description: "Sua sessão do WhatsApp foi desconectada."
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <CustomHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Conectar WhatsApp</h1>
        
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Status da Conexão</CardTitle>
              <CardDescription className="text-gray-400">
                Verifique e gerencie a conexão do seu WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 border-red-900 bg-red-950">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="bg-gray-700 p-4 rounded-md mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${session?.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <p className="font-medium text-gray-200">
                    {session?.connected 
                      ? "WhatsApp conectado" 
                      : "WhatsApp não conectado"}
                  </p>
                </div>
                
                {session && (
                  <p className="text-sm text-gray-400 mt-2">
                    Instância: {session.instanceName}
                  </p>
                )}
              </div>
              
              {showQrCode && session?.qrCode && !session.connected && (
                <div className="flex justify-center my-8">
                  <div className="border border-gray-700 p-4 bg-white rounded-md">
                    <img 
                      src={session.qrCode} 
                      alt="QR Code para conexão do WhatsApp" 
                      className="w-64 h-64 object-contain"
                    />
                    <p className="text-sm text-center text-gray-500 mt-2">
                      Escaneie este QR Code com seu WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              {!showQrCode && !session?.connected && (
                <Button 
                  onClick={handleGenerateQRCode} 
                  disabled={isLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Gerar QR Code
                    </>
                  )}
                </Button>
              )}
              
              {showQrCode && !session?.connected && (
                <>
                  <Button 
                    onClick={handleCheckConnection} 
                    disabled={isLoading}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Verificar Conexão
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleGenerateQRCode} 
                    variant="outline" 
                    disabled={isLoading}
                    className="gap-2 border-gray-600 text-gray-200 hover:bg-gray-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Novo QR Code
                  </Button>
                </>
              )}
              
              {session?.connected && (
                <>
                  <Button 
                    onClick={() => navigate("/contatos")}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4" />
                    Ir para Contatos
                  </Button>
                  
                  <Button 
                    onClick={handleDisconnect} 
                    variant="outline"
                    className="gap-2 border-gray-600 text-gray-200 hover:bg-gray-700"
                  >
                    Desconectar WhatsApp
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
          
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h3 className="font-semibold mb-2 text-gray-200">Como conectar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Clique no botão "Gerar QR Code"</li>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em Menu (três pontos) {'>'} WhatsApp Web</li>
              <li>Aponte a câmera para o QR Code</li>
              <li>Aguarde a conexão ser estabelecida</li>
              <li>Clique em "Verificar Conexão"</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhatsAppConnect;
