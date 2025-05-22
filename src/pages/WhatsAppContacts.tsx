import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, Upload, Download, MessageSquare, Loader2, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const templateCSV = `nome,telefone
João Silva,5511999999999
Maria Oliveira,5511988888888`;

// Function to format phone numbers
const formatPhoneNumber = (phone: string): string => {
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

const WhatsAppContacts = () => {
  const { 
    contacts, 
    selectedContacts,
    loadingContacts, 
    isLoading,
    uploadContacts, 
    sendMessage,
    sendBulkMessages,
    toggleContactSelection,
    clearSelectedContacts,
    selectAllContacts,
    session
  } = useWhatsApp();
  
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>("");
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
      uploadContacts(file);
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

  const handleSendMessage = async () => {
    if (selectedContacts.length === 0 || !message.trim()) {
      toast.warning("Selecione contatos e escreva uma mensagem", {
        description: "Você precisa selecionar pelo menos um contato e escrever uma mensagem."
      });
      return;
    }
    
    // Get the Contact objects for all selected contacts
    const contactsToSend = contacts.filter(c => selectedContacts.includes(c.id));
    
    if (contactsToSend.length === 0) {
      toast.error("Nenhum contato válido selecionado");
      return;
    }
    
    // Send messages to all selected contacts
    await sendBulkMessages(contactsToSend, message);
    
    // Reset message field after sending
    setMessage("");
    clearSelectedContacts();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Contatos</h1>
          <Button onClick={() => navigate("/whatsapp")}>Voltar para WhatsApp</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column - Upload and contacts list */}
          <div className="md:col-span-7">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Importar Contatos</CardTitle>
                <CardDescription>
                  Faça upload de uma planilha CSV com seus contatos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => fileInput?.click()}
                    variant="outline"
                    className="gap-2"
                  >
                    <Upload size={16} /> Importar Contatos
                  </Button>
                  <Button 
                    onClick={handleDownloadTemplate}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Download size={16} /> Baixar Template
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleUpload}
                    ref={ref => setFileInput(ref)}
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>O arquivo CSV deve ter as colunas:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>nome: Nome do contato</li>
                    <li>telefone: Número com DDD (ex: 5511999999999)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Seus Contatos</CardTitle>
                  <CardDescription>
                    {contacts.length} contatos importados
                  </CardDescription>
                </div>
                {contacts.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllContacts}
                    >
                      Selecionar Todos
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearSelectedContacts}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loadingContacts ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Nenhum contato importado</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Importe contatos usando o botão acima
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <span className="sr-only">Selecionar</span>
                          </TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow 
                            key={contact.id}
                            className={selectedContacts.includes(contact.id) ? "bg-primary-50" : ""}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={() => toggleContactSelection(contact.id)}
                                aria-label={`Selecionar ${contact.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{formatPhoneNumber(contact.phone)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleContactSelection(contact.id)}
                                className="h-8 w-8 p-0"
                              >
                                {selectedContacts.includes(contact.id) ? (
                                  <CheckCheck size={16} className="text-primary" />
                                ) : (
                                  <Send size={16} className="text-primary" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Messaging */}
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem</CardTitle>
                <CardDescription>
                  {selectedContacts.length > 0 
                    ? `Enviando para: ${selectedContacts.length} contatos selecionados`
                    : "Selecione um ou mais contatos para enviar mensagem"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedContacts.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center mb-2">
                      <Check size={16} className="text-green-500 mr-2" />
                      <p className="text-sm font-medium">{selectedContacts.length} contatos selecionados</p>
                    </div>
                    {selectedContacts.length <= 5 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedContacts.map((contactId) => {
                          const contact = contacts.find(c => c.id === contactId);
                          return contact ? (
                            <div key={contactId} className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded">
                              {contact.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    {selectedContacts.length > 5 && (
                      <p className="text-xs text-gray-500">
                        {contacts.find(c => c.id === selectedContacts[0])?.name}, {contacts.find(c => c.id === selectedContacts[1])?.name} e mais {selectedContacts.length - 2} contatos
                      </p>
                    )}
                  </div>
                )}
                
                <Textarea 
                  placeholder={selectedContacts.length > 0 
                    ? "Digite sua mensagem aqui..." 
                    : "Selecione um ou mais contatos primeiro"}
                  disabled={selectedContacts.length === 0}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px]"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    clearSelectedContacts();
                    setMessage("");
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={selectedContacts.length === 0 || !message.trim() || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Enviar Mensagem{selectedContacts.length > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WhatsAppContacts;
