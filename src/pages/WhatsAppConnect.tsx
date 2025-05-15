
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

const WhatsAppConnect = () => {
  const { session, isLoading, error, createSession, resetSession, chats, loadingChats, fetchChats } = useWhatsApp();
  const [activeTab, setActiveTab] = useState<string>("connect");
  
  // Automatically switch to chats tab when connected
  useEffect(() => {
    if (session?.connected) {
      setActiveTab("chats");
      fetchChats();
    }
  }, [session?.connected, fetchChats]);

  // Auto-connect when page loads if no session exists
  useEffect(() => {
    const shouldAutoConnect = !session && !isLoading && activeTab === "connect";
    if (shouldAutoConnect) {
      createSession();
    }
  }, []);

  const handleSendMessage = (remoteJid: string, name: string) => {
    toast(`Preparando mensagem para ${name}`, {
      description: "Funcionalidade de envio em desenvolvimento."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">WhatsApp</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="connect">Conectar</TabsTrigger>
            <TabsTrigger value="chats" disabled={!session?.connected}>Conversas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect">
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
                      onClick={() => setActiveTab("chats")}
                      className="flex-1"
                    >
                      Ver Conversas
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
          </TabsContent>
          
          <TabsContent value="chats">
            <Card>
              <CardHeader>
                <CardTitle>Suas Conversas</CardTitle>
                <CardDescription>
                  Selecione um contato para enviar uma mensagem de remarketing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingChats ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : chats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-500">Nenhuma conversa encontrada</p>
                    <Button 
                      variant="outline" 
                      onClick={fetchChats} 
                      className="mt-4"
                    >
                      Atualizar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chats.map((chat) => (
                      <div key={chat.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            {chat.profilePicUrl && (
                              <AvatarImage src={chat.profilePicUrl} alt={chat.pushName} />
                            )}
                            <AvatarFallback>{chat.pushName?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{chat.pushName || "Sem nome"}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(chat.updatedAt).toLocaleString('pt-BR', { 
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSendMessage(chat.remoteJid, chat.pushName)}
                        >
                          <Send size={16} /> Mensagem
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("connect")}>
                  Voltar
                </Button>
                <Button onClick={fetchChats} disabled={loadingChats}>
                  {loadingChats ? "Atualizando..." : "Atualizar Conversas"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WhatsAppConnect;
