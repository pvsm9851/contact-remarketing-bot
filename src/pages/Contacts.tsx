import { useState, useEffect } from "react";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { useNavigate } from "react-router-dom";
import { CustomHeader } from "@/components/CustomHeader";
import { ContactsList } from "@/components/ContactsList";
import { SendMessage } from "@/components/SendMessage";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const TEMPLATE_INSTRUCTIONS = `
Instruções:
1. Não altere a primeira linha (cabeçalho)
2. Cada linha deve conter nome e telefone separados por vírgula
3. O telefone deve estar no formato: 55 + DDD + número
4. Exemplo: 5511999999999 (55 = Brasil, 11 = DDD, 999999999 = número)
5. Não use espaços ou caracteres especiais no número
6. Não use acentos no nome`;

const Contacts: React.FC = () => {
  const { session, parseContactsFile, checkConnection } = useWhatsApp();
  const navigate = useNavigate();
  const [templateContent, setTemplateContent] = useState<string>("");
  const [isVerifyingConnection, setIsVerifyingConnection] = useState(false);

  // Verifica a conexão apenas se não estiver conectado
  useEffect(() => {
    const verifyConnection = async () => {
      if (!session?.connected) {
        console.log("Not connected in Contacts page, checking connection");
        setIsVerifyingConnection(true);
        const isConnected = await checkConnection();
        console.log("Connection check result:", isConnected);
        
        if (!isConnected) {
          console.log("Not connected, redirecting to WhatsApp page");
          navigate("/whatsapp");
        }
        setIsVerifyingConnection(false);
      }
    };

    verifyConnection();
  }, [session?.connected, checkConnection, navigate]);

  // Carrega o template quando o componente é montado
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/template/template_contatos.csv');
        const text = await response.text();
        setTemplateContent(text + TEMPLATE_INSTRUCTIONS);
      } catch (error) {
        console.error('Erro ao carregar template:', error);
        setTemplateContent(`nome,telefone
João Silva,5511999999999
Maria Santos,5511988888888
João Oliveira,5511977777777
Ana Pereira,5511966666666${TEMPLATE_INSTRUCTIONS}`);
      }
    };

    loadTemplate();
  }, []);

  if (isVerifyingConnection) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-300">Verificando conexão com WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <CustomHeader />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-gray-400 mt-2">
            Gerencie seus contatos e envie mensagens
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Contatos */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <Tabs defaultValue="contacts" className="space-y-6">
              <TabsList className="bg-gray-700">
                <TabsTrigger value="contacts" className="data-[state=active]:bg-gray-600">
                  Contatos
                </TabsTrigger>
                <TabsTrigger value="import" className="data-[state=active]:bg-gray-600">
                  Importar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contacts">
                <ContactsList />
              </TabsContent>

              <TabsContent value="import">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Importar Contatos</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          parseContactsFile(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-gray-700 file:text-gray-300
                        hover:file:bg-gray-600
                        cursor-pointer"
                    />
                    <p className="text-xs text-gray-400">
                      Apenas arquivos CSV são aceitos
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Template de Exemplo</h4>
                    <pre className="p-4 bg-gray-900 rounded-md text-xs font-mono whitespace-pre-wrap">
                      {templateContent}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Envio de Mensagens */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <SendMessage />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contacts; 