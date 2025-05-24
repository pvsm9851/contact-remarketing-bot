import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomHeader } from "@/components/CustomHeader";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendMessage } from "@/components/SendMessage";
import { ContactsList } from "@/components/ContactsList";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const templateCSV = `nome,telefone
João Silva,"5511999887766"
Maria Santos,"5511988776655"`;

// Function to format phone numbers
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Check if the phone number has been converted to scientific notation by Excel
  if (phone.includes('E+') || phone.includes('e+')) {
    try {
      // Convert from scientific notation back to a full number string
      return String(Number(phone).toFixed(0));
    } catch (error) {
      console.error("Error formatting phone number from scientific notation:", error);
      return phone;
    }
  }
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it starts with country code (e.g., 55 for Brazil)
  if (digits.startsWith('55') && digits.length >= 12) {
    const countryCode = digits.substring(0, 2);
    const areaCode = digits.substring(2, 4);
    const firstPart = digits.substring(4, 9);
    const secondPart = digits.substring(9);
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  } 
  
  // Handle numbers without country code (add Brazilian code)
  else if (digits.length >= 10) {
    const areaCode = digits.substring(0, 2);
    const firstPart = digits.substring(2, 7);
    const secondPart = digits.substring(7);
    return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
  }
  
  // Return original if we can't format it
  return phone;
};

export default function WhatsAppContacts() {
  const { session, parseContactsFile } = useWhatsApp();
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  
  // Check if WhatsApp is connected
  useEffect(() => {
    if (!session?.connected) {
      toast.warning("WhatsApp não conectado", {
        description: "Conecte seu WhatsApp primeiro para enviar mensagens."
      });
      navigate("/whatsapp");
    }
  }, [session, navigate]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseContactsFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([templateCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_contatos.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
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
            <CardHeader>
              <CardTitle className="text-gray-100">Importar Contatos</CardTitle>
              <CardDescription className="text-gray-400">
                Faça upload de um arquivo CSV com seus contatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInput?.click()}
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
                  type="file"
                  accept=".csv"
                  onChange={handleUpload}
                  className="hidden"
                  ref={setFileInput}
                />
              </div>
              <p className="text-sm text-gray-400">
                O arquivo deve estar no formato CSV com as colunas: nome, telefone
              </p>
            </CardContent>
          </Card>

          {/* Tabs for Contacts and Messages */}
          <Tabs defaultValue="contacts" className="space-y-4">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="contacts">Contatos</TabsTrigger>
              <TabsTrigger value="messages">Enviar Mensagens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <ContactsList />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <SendMessage />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
