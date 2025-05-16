
import React, { createContext, useState, useContext, useEffect } from "react";
import { WhatsAppSession, Contact } from "@/types";
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
  
  // N8N API configuration
  const N8N_API_URL = "https://api.mavicmkt.com.br";
  const N8N_API_KEY = "c87ea0c8c68239cc4c7a001f960efbca";

  // Check if there's an existing session on mount
  useEffect(() => {
    if (auth.user) {
      const storedSession = localStorage.getItem(`whatsapp_session_${auth.user.id}`);
      if (storedSession) {
        try {
          setSession(JSON.parse(storedSession));
          // If we have a session, check its status
          if (JSON.parse(storedSession).session) {
            checkSessionStatus(JSON.parse(storedSession).session);
          }
        } catch (e) {
          console.error("Failed to parse stored session", e);
          localStorage.removeItem(`whatsapp_session_${auth.user.id}`);
        }
      }
    }
  }, [auth.user]);
  
  // Check the status of a session with the N8N API
  const checkSessionStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`${N8N_API_URL}/instance/connectionState/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": N8N_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Session status:", data);
      
      if (data.instance?.state === "open") {
        updateSessionStatus(sessionId, true);
      }
    } catch (e) {
      console.error("Failed to check session status", e);
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
    }
  };

  // Create a new WhatsApp session using the N8N API
  const createSession = async () => {
    if (!auth.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a unique session ID
      const timestamp = Date.now();
      const sessionId = `session-${timestamp}`;
      
      // Call the N8N API to create a new WhatsApp instance
      const response = await fetch(`${N8N_API_URL}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": N8N_API_KEY
        },
        body: JSON.stringify({
          instanceName: sessionId,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS"
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Create instance response:", data);
      
      if (data.qrcode && data.qrcode.base64) {
        // Store the session and QR code
        const newSession: WhatsAppSession = {
          session: sessionId,
          instanceName: sessionId,
          connected: false,
          qrCode: data.qrcode.base64
        };
        
        setSession(newSession);
        localStorage.setItem(`whatsapp_session_${auth.user.id}`, JSON.stringify(newSession));
        
        toast("Sessão criada", {
          description: "Escaneie o código QR para conectar seu WhatsApp."
        });

        // Start polling for connection status
        setTimeout(() => checkStatus(), 5000);
      } else {
        throw new Error("QR code not received from API");
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
      // Call the N8N API to check the status of the WhatsApp instance
      const response = await fetch(`${N8N_API_URL}/instance/connectionState/${session.session}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": N8N_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Instance status:", data);
      
      if (data.instance?.state === "open") {
        updateSessionStatus(session.session, true);
      } else {
        // If still not connected, check again in a few seconds
        setTimeout(() => checkStatus(), 5000);
      }
      
    } catch (e) {
      console.error("Failed to check WhatsApp status", e);
      setError("Falha ao verificar status do WhatsApp. Por favor, tente novamente.");
    }
  };
  
  const resetSession = () => {
    if (!auth.user || !session) return;
    
    try {
      // Call the N8N API to disconnect/delete the WhatsApp instance
      fetch(`${N8N_API_URL}/instance/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": N8N_API_KEY
        },
        body: JSON.stringify({
          instanceName: session.session
        })
      }).catch(e => console.error("Error logging out instance:", e));
      
      localStorage.removeItem(`whatsapp_session_${auth.user.id}`);
      setSession(null);
      
      toast("Sessão resetada", {
        description: "A conexão com WhatsApp foi desfeita."
      });
    } catch (e) {
      console.error("Failed to reset session", e);
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
      
      const response = await fetch(`${N8N_API_URL}/message/sendText/${session.session}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": N8N_API_KEY
        },
        body: JSON.stringify({
          number: `${formattedPhone}@s.whatsapp.net`,
          options: {
            delay: 1200
          },
          textMessage: message
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.key) {
        toast("Mensagem enviada", {
          description: "Sua mensagem foi enviada com sucesso!"
        });
      } else {
        throw new Error("Failed to send message");
      }
      
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
      sendMessage
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};
