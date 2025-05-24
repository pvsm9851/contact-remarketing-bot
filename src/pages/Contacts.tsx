import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomHeader } from "@/components/CustomHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactsList } from "@/components/ContactsList";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_INSTRUCTIONS = `
IMPORTANTE:
- A coluna telefone deve conter apenas números, sem espaços ou caracteres especiais
- O número deve estar no formato: 55 + DDD + número (exemplo: 5511999999999)
- NÃO use fórmulas ou formatação especial na coluna de telefone
- Salve o arquivo como CSV (separado por vírgulas)
- Certifique-se que o arquivo esteja codificado em UTF-8`;

const Contacts: React.FC = () => {
  const { auth } = useAuth();
  const { session, parseContactsFile, checkConnection } = useWhatsApp();
  const navigate = useNavigate();
  const [templateContent, setTemplateContent] = useState<string>("");

  // Verifica a conexão periodicamente
  useEffect(() => {
    const verifyConnection = async () => {
      if (!session?.connected) {
        console.log("Checking connection in Contacts page");
        const isConnected = await checkConnection();
        console.log("Connection check result:", isConnected);
        
        if (!isConnected) {
          console.log("Not connected, redirecting to WhatsApp page");
          navigate("/whatsapp");
        }
      }
    };

    verifyConnection();
    const interval = setInterval(verifyConnection, 30000);
    return () => clearInterval(interval);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      e.target.value = '';
      
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast.error("Formato inválido", {
          description: "Por favor, selecione um arquivo CSV."
        });
        return;
      }

      await parseContactsFile(file);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao importar contatos", {
        description: "Verifique se o arquivo está no formato correto e tente novamente."
      });
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template/template_contatos.csv';
    link.download = 'template_contatos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Template baixado", {
      description: "O template para importação de contatos foi baixado com sucesso."
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <CustomHeader />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Contatos</h1>
          <p className="text-gray-400 mt-2">
            Importe seus contatos e envie mensagens em massa
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="border-gray-700 text-gray-300 hover:bg-gray-700"
                  >
                    Baixar Template
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  O arquivo deve estar no formato CSV com as colunas: nome, telefone
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contacts List with Messages */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <ContactsList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contacts; 