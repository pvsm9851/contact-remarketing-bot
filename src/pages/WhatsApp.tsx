import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomHeader } from "@/components/CustomHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Loader2, QrCode, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ConnectionLoading from "@/components/ConnectionLoading";

const WhatsApp: React.FC = () => {
  const { auth } = useAuth();
  const { session, isLoading, error, generateQRCode, checkConnection } = useWhatsApp();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isVerifyingConnection, setIsVerifyingConnection] = useState(true);

  // Verifica a conexão ao montar o componente
  useEffect(() => {
    const verifyInitialConnection = async () => {
      if (!auth.user?.instance) {
        console.error("Instância do usuário não encontrada");
        toast.error("Erro de configuração", {
          description: "Instância do WhatsApp não encontrada. Entre em contato com o suporte."
        });
        return;
      }

      setIsVerifyingConnection(true);
      console.log("Verificando conexão inicial para instância:", auth.user.instance);
      
      // Verifica a conexão primeiro
      const isConnected = await checkConnection();
      console.log("Estado da conexão:", isConnected);
      setIsVerifyingConnection(false);
    };

    verifyInitialConnection();
  }, [auth.user]);

  const handleCheckConnection = async () => {
    setCheckingStatus(true);
    try {
      console.log("Verificando conexão manualmente");
      const isConnected = await checkConnection();
      if (isConnected) {
        console.log("Conexão verificada manualmente");
        toast.success("WhatsApp conectado", {
          description: "Sua conta está conectada e pronta para uso."
        });
      } else {
        console.log("Não está conectado, permanecendo na página");
        toast.error("WhatsApp não conectado", {
          description: "Por favor, escaneie o QR code para conectar.",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      toast.error("Erro ao verificar conexão", {
        description: "Houve um problema ao verificar o status da conexão.",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleGenerateQRCode = async () => {
    await generateQRCode();
  };

  if (isVerifyingConnection) {
    return <ConnectionLoading />;
  }

  if (session?.connected) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <CustomHeader />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">WhatsApp Conectado</h1>
            <p className="text-gray-400 mt-2">
              Sua conta está conectada e pronta para uso
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <CardTitle className="text-gray-100">Conexão Ativa</CardTitle>
                  <CardDescription className="text-gray-400">
                    Você já pode começar a usar o sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Agora você pode:
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li>• Importar e gerenciar contatos</li>
                  <li>• Enviar mensagens personalizadas</li>
                  <li>• Acompanhar estatísticas de envio</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/contatos")}
                className="w-full"
              >
                Ir para Contatos
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
                  <p className="mt-4 text-gray-400">Gerando código QR...</p>
                </div>
              ) : session?.qrCode ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <img 
                      src={session.qrCode} 
                      alt="WhatsApp QR Code" 
                      className="w-full max-w-[240px] h-auto" 
                    />
                  </div>
                  <p className="mt-4 text-gray-400 text-center text-sm">
                    Aguardando escaneamento...
                  </p>
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
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleGenerateQRCode}
                disabled={isLoading}
                className="w-full gap-2"
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
              <Button
                onClick={handleCheckConnection}
                disabled={checkingStatus || isLoading}
                variant="outline"
                className="w-full gap-2 border-gray-700 text-gray-300 hover:bg-gray-700"
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

export default WhatsApp; 