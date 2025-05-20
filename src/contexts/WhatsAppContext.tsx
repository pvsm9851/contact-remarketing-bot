
import React, { createContext, useState, useContext, useEffect } from "react";
import { WhatsAppSession, Contact, WhatsAppChat } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WhatsAppContextType {
  session: WhatsAppSession | null;
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<void>;
  checkStatus: () => Promise<void>;
  resetSession: () => void;
  contacts: Contact[];
  loadingContacts: boolean;
  uploadContacts: (file: File) => Promise<void>;
  sendMessage: (phone: string, message: string) => Promise<void>;
  chats: WhatsAppChat[];
  loadingChats: boolean;
  fetchChats: () => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  }
  return context;
};

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  
  // Webhook URLs
  const WEBHOOK_QRCODE_GENERATE = "https://webhook.mavicmkt.com.br/webhook/28bebbde-21e9-405d-be7f-e724638be60f";
  const WEBHOOK_CHECK_CONNECTION = "https://webhook.mavicmkt.com.br/webhook/b66aa268-0ce8-4e95-9d31-23e8fba992ea";
  const WEBHOOK_GET_CHATS = "https://webhook.mavicmkt.com.br/webhook/d2558660-69f3-470e-82af-1d57266790b8";
  
  // Check if there's an existing session on mount
  useEffect(() => {
    if (auth.user) {
      const storedSession = localStorage.getItem(`whatsapp_session_${auth.user.id}`);
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          
          // If session exists, check connection status
          if (parsedSession) {
            checkStatus();
          }
        } catch (e) {
          console.error("Failed to parse stored session", e);
          localStorage.removeItem(`whatsapp_session_${auth.user.id}`);
        }
      }
    }
  }, [auth.user]);

  // Create a new WhatsApp session
  const createSession = async () => {
    if (!auth.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the webhook to create QR code
      const response = await fetch(WEBHOOK_QRCODE_GENERATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instance: `session-${Date.now()}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("QR code response:", data);
      
      if (data.image) {
        // Store the session and QR code
        const newSession: WhatsAppSession = {
          session: auth.user.id,
          instanceName: auth.user.id,
          connected: false,
          qrCode: data.image
        };
        
        setSession(newSession);
        localStorage.setItem(`whatsapp_session_${auth.user.id}`, JSON.stringify(newSession));
        
        toast("Sessão criada", {
          description: "Escaneie o código QR para conectar seu WhatsApp."
        });
      } else {
        throw new Error("QR code not received from webhook");
      }
      
    } catch (e) {
      console.error("Failed to create WhatsApp session", e);
      setError("Falha ao criar sessão do WhatsApp. Por favor, tente novamente.");
      
      toast("Erro", {
        description: "Falha ao criar sessão do WhatsApp."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!session || !auth.user) return;
    
    try {
      // Call the webhook to check connection status
      const response = await fetch(WEBHOOK_CHECK_CONNECTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instance: `session-${Date.now()}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Connection status:", data);
      
      if (data.status === "connected") {
        updateSessionStatus(auth.user.id, true);
      } else if (data.status === "offline") {
        updateSessionStatus(auth.user.id, false);
        toast("WhatsApp desconectado", {
          description: "Seu WhatsApp não está conectado. Tente escanear o QR code novamente."
        });
      }
      
    } catch (e) {
      console.error("Failed to check WhatsApp status", e);
      setError("Falha ao verificar status do WhatsApp. Por favor, tente novamente.");
    }
  };
  
  // Update the session status locally
  const updateSessionStatus = (sessionId: string, connected: boolean) => {
    if (!auth.user) return;
    
    const updatedSession = {
      session: sessionId,
      instanceName: sessionId,
      connected: connected,
      qrCode: session?.qrCode
    };
    
    setSession(updatedSession);
    localStorage.setItem(`whatsapp_session_${auth.user.id}`, JSON.stringify(updatedSession));
    
    if (connected) {
      toast("WhatsApp conectado", {
        description: "Seu WhatsApp foi conectado com sucesso!"
      });
      
      // When connected, fetch chats
      fetchChats();
    }
  };
  
  const resetSession = () => {
    if (!auth.user || !session) return;
    
    try {
      localStorage.removeItem(`whatsapp_session_${auth.user.id}`);
      setSession(null);
      setChats([]);
      
      toast("Sessão resetada", {
        description: "A conexão com WhatsApp foi desfeita."
      });
    } catch (e) {
      console.error("Failed to reset session", e);
    }
  };

  // Function to fetch WhatsApp chats
  const fetchChats = async (): Promise<void> => {
    if (!session?.connected) {
      return;
    }
    
    setLoadingChats(true);
    
    try {
      // Call the webhook to fetch chats
      const response = await fetch(WEBHOOK_GET_CHATS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instance: `session-${Date.now()}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched chats:", data);
      
      setChats(data);
      
    } catch (e) {
      console.error("Failed to fetch chats:", e);
      toast("Erro", {
        description: "Falha ao buscar conversas. Por favor, tente novamente."
      });
    } finally {
      setLoadingChats(false);
    }
  };

  // Function to upload contacts from CSV file
  const uploadContacts = async (file: File): Promise<void> => {
    setLoadingContacts(true);
    
    try {
      const text = await file.text();
      const rows = text.split('\n');
      
      // Skip header row and process the data
      const parsedContacts: Contact[] = rows
        .slice(1)
        .filter(row => row.trim() !== '')
        .map((row, index) => {
          const [name, phone] = row.split(',').map(item => item.trim());
          const formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
          
          return {
            id: `contact-${index}`,
            name: name || 'Sem nome',
            phone: formattedPhone,
            lastContact: new Date().toISOString()
          };
        });
      
      setContacts(parsedContacts);
      
      toast("Contatos importados", {
        description: `${parsedContacts.length} contatos foram importados com sucesso!`
      });
      
    } catch (error) {
      console.error("Failed to parse CSV file:", error);
      toast("Erro", {
        description: "Falha ao processar o arquivo CSV. Verifique se o formato está correto."
      });
    } finally {
      setLoadingContacts(false);
    }
  };

  // Function to send a WhatsApp message
  const sendMessage = async (phone: string, message: string): Promise<void> => {
    if (!session?.session || !session.connected) {
      toast("Erro", {
        description: "WhatsApp não está conectado."
      });
      return;
    }
    
    try {
      // Format phone number to make sure it has the country code
      const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
      
      // We would normally call an API here, but for now we'll just simulate success
      toast("Mensagem enviada", {
        description: "Sua mensagem foi enviada com sucesso!"
      });
      
    } catch (error) {
      console.error("Failed to send message:", error);
      toast("Erro", {
        description: "Falha ao enviar mensagem. Por favor, tente novamente."
      });
    }
  };

  return (
    <WhatsAppContext.Provider value={{ 
      session, 
      isLoading, 
      error, 
      createSession, 
      checkStatus, 
      resetSession,
      contacts,
      loadingContacts,
      uploadContacts,
      sendMessage,
      chats,
      loadingChats,
      fetchChats
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};
