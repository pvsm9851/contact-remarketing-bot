
import { useState } from "react";
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
import { Send, Upload, Download, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

const templateCSV = `nome,telefone
João Silva,5511999999999
Maria Oliveira,5511988888888`;

const WhatsAppContacts = () => {
  const { contacts, loadingContacts, uploadContacts, sendMessage } = useWhatsApp();
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

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
    if (!selectedContactId || !message.trim()) {
      toast("Erro", {
        description: "Selecione um contato e escreva uma mensagem."
      });
      return;
    }
    
    setSending(true);
    const contact = contacts.find(c => c.id === selectedContactId);
    if (contact) {
      try {
        await sendMessage(contact.phone, message);
        setMessage("");
        setSelectedContactId(null);
      } finally {
        setSending(false);
      }
    } else {
      setSending(false);
    }
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
              <CardHeader>
                <CardTitle>Seus Contatos</CardTitle>
                <CardDescription>
                  {contacts.length} contatos importados
                </CardDescription>
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
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow 
                            key={contact.id}
                            className={selectedContactId === contact.id ? "bg-primary-50" : ""}
                          >
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedContactId(contact.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Send size={16} className="text-primary" />
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
                  {selectedContactId 
                    ? `Enviando para: ${contacts.find(c => c.id === selectedContactId)?.name}`
                    : "Selecione um contato para enviar mensagem"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedContactId && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {contacts.find(c => c.id === selectedContactId)?.name.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{contacts.find(c => c.id === selectedContactId)?.name}</p>
                      <p className="text-sm text-gray-500">{contacts.find(c => c.id === selectedContactId)?.phone}</p>
                    </div>
                  </div>
                )}
                
                <Textarea 
                  placeholder={selectedContactId 
                    ? "Digite sua mensagem aqui..." 
                    : "Selecione um contato primeiro"}
                  disabled={!selectedContactId}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px]"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedContactId(null);
                    setMessage("");
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!selectedContactId || !message.trim() || sending}
                  className="gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Enviar Mensagem
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
