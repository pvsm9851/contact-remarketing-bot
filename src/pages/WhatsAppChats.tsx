
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

const WhatsAppChats = () => {
  const { session, chats, loadingChats, fetchChats } = useWhatsApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch chats when the component mounts if we're connected
    if (session?.connected) {
      fetchChats();
    }
  }, [session?.connected]);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/whatsapp")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Conversas do WhatsApp</h1>
          </div>
          
          <Button 
            onClick={fetchChats}
            disabled={loadingChats || !session?.connected}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loadingChats ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        {!session?.connected ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
              <h3 className="text-xl font-semibold">WhatsApp Não Conectado</h3>
              <p className="text-gray-500 mt-2 mb-4">Você precisa conectar seu WhatsApp para visualizar as conversas.</p>
              <Button onClick={() => navigate("/whatsapp")}>
                Conectar WhatsApp
              </Button>
            </CardContent>
          </Card>
        ) : loadingChats ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[300px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
              <h3 className="text-xl font-semibold">Nenhuma Conversa Encontrada</h3>
              <p className="text-gray-500 mt-2">
                Não encontramos nenhuma conversa no seu WhatsApp conectado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chats.map((chat) => (
              <Card key={chat.id} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      {chat.profilePicUrl ? (
                        <AvatarImage src={chat.profilePicUrl} alt={chat.pushName} />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(chat.pushName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{chat.pushName}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(chat.updatedAt)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-500 truncate">
                          {chat.remoteJid.includes('@g.us') ? (
                            <Badge variant="outline" className="mr-2">Grupo</Badge>
                          ) : null}
                          {chat.remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '')}
                        </p>
                        
                        {chat.windowActive && (
                          <Badge variant="secondary" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WhatsAppChats;
