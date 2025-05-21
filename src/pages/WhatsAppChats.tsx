
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WhatsAppChat } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const WhatsAppChats = () => {
  const { session, chats, isLoading, error, getChats, checkConnection, sendMessage } = useWhatsApp();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const checkWhatsAppConnection = async () => {
      if (!session) {
        navigate("/whatsapp");
        return;
      }

      const isConnected = await checkConnection();
      if (!isConnected) {
        toast("WhatsApp não conectado", {
          description: "Você precisa conectar seu WhatsApp para ver as conversas."
        });
        navigate("/whatsapp");
      }
    };

    checkWhatsAppConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session?.connected) {
      loadChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const loadChats = async () => {
    try {
      await getChats();
    } catch (error) {
      console.error("Error loading chats:", error);
      toast("Erro ao carregar conversas", {
        description: "Ocorreu um erro ao carregar suas conversas do WhatsApp."
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const isConnected = await checkConnection();
      if (isConnected) {
        await getChats();
        toast("Conversas atualizadas", {
          description: "Suas conversas do WhatsApp foram atualizadas."
        });
      } else {
        toast("WhatsApp não conectado", {
          description: "Reconecte seu WhatsApp para ver as conversas."
        });
        navigate("/whatsapp");
      }
    } catch (error) {
      console.error("Error refreshing chats:", error);
      toast("Erro ao atualizar conversas", {
        description: "Ocorreu um erro ao atualizar suas conversas do WhatsApp."
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !messageText.trim()) return;
    
    setSendingMessage(true);
    try {
      const success = await sendMessage(selectedChat.remoteJid, messageText);
      if (success) {
        setMessageText("");
        setSelectedChat(null);
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data desconhecida";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Conversas do WhatsApp</h1>
          
          <Button 
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="flex items-center gap-2"
          >
            {(refreshing || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
            {refreshing ? "Atualizando..." : "Atualizar Conversas"}
          </Button>
        </div>
        
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
        
        {isLoading && !refreshing ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando conversas...</span>
          </div>
        ) : chats.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma conversa encontrada</h2>
              <p className="text-muted-foreground text-center">
                Não encontramos nenhuma conversa no WhatsApp conectado.<br />
                Verifique se seu WhatsApp está conectado corretamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chats.map((chat) => (
              <ChatCard 
                key={chat.id} 
                chat={chat} 
                onSendMessage={() => setSelectedChat(chat)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Send Message Dialog */}
      <Dialog open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar mensagem</DialogTitle>
            <DialogDescription>
              {selectedChat && `Para: ${selectedChat.pushName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedChat && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <Avatar>
                  <AvatarImage src={selectedChat.profilePicUrl || undefined} alt={selectedChat.pushName} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(selectedChat.pushName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedChat.pushName}</p>
                  <p className="text-sm text-gray-500">{selectedChat.remoteJid.split("@")[0]}</p>
                </div>
              </div>
            )}
            
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="min-h-[120px]"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedChat(null)}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendingMessage}
              className="gap-2"
            >
              {sendingMessage && <Loader2 className="h-4 w-4 animate-spin" />}
              {sendingMessage ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Chat Card component
const ChatCard: React.FC<{ 
  chat: WhatsAppChat;
  onSendMessage: () => void;
}> = ({ chat, onSendMessage }) => {
  const isGroup = chat.remoteJid.includes("@g.us");
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data desconhecida";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className={isGroup ? "bg-green-100" : "bg-blue-100"}>
            <AvatarImage src={chat.profilePicUrl || undefined} alt={chat.pushName} />
            <AvatarFallback className={isGroup ? "text-green-700 bg-green-100" : "text-blue-700 bg-blue-100"}>
              {getInitials(chat.pushName)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <CardTitle className="text-base font-medium flex items-center">
              {chat.pushName}
              {isGroup && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Grupo
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs truncate">
              {chat.remoteJid.split("@")[0]}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm">
        <p className="text-muted-foreground text-xs">
          Última atualização: {formatDate(chat.updatedAt)}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center">
        <div>
          {chat.windowActive ? (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Janela de contato ativa
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Janela de contato inativa
            </span>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0" 
          onClick={(e) => {
            e.stopPropagation();
            onSendMessage();
          }}
        >
          <Send size={16} className="text-primary" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WhatsAppChats;

