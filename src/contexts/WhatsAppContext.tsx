
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { WhatsAppSession, WhatsAppChat, Contact } from "@/types";
import { apiService } from "@/services/apiService";

interface WhatsAppContextType {
  session: WhatsAppSession | null;
  chats: WhatsAppChat[];
  contacts: Contact[];
  isLoading: boolean;
  loadingContacts: boolean;
  error: string | null;
  generateQRCode: () => Promise<string | null>;
  checkConnection: () => Promise<boolean>;
  getChats: () => Promise<WhatsAppChat[]>;
  disconnectSession: () => void;
  uploadContacts: (file: File) => Promise<boolean>;
  sendMessage: (phone: string, message: string) => Promise<boolean>;
}

// Make sure the Context is properly initialized with undefined as default
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
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("whatsapp_session");
    // Check for stored instance from registration
    const storedInstance = localStorage.getItem("whatsapp_instance");
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      } catch (e) {
        console.error("Failed to parse stored WhatsApp session", e);
        localStorage.removeItem("whatsapp_session");
      }
    } else if (storedInstance && auth.user) {
      // If we have an instance from registration but no session yet
      // create a placeholder session object
      const newSession: WhatsAppSession = {
        session: storedInstance,
        instanceName: storedInstance,
        connected: false,
        qrCode: null,
      };
      setSession(newSession);
      localStorage.setItem("whatsapp_session", JSON.stringify(newSession));
    }
    
    // Load demo contacts for now
    setContacts([
      { id: '1', name: 'João Silva', phone: '5511999999999' },
      { id: '2', name: 'Maria Oliveira', phone: '5511988888888' },
      { id: '3', name: 'Carlos Pereira', phone: '5511977777777' },
    ]);
  }, [auth.user]);

  // Generate QR Code
  const generateQRCode = async (): Promise<string | null> => {
    if (!auth.user) {
      setError("User not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use instance ID from stored registration data if available
      const storedInstance = localStorage.getItem("whatsapp_instance");
      const instanceName = storedInstance || `session-${Date.now()}`;
      
      console.log("Generating QR code for instance:", instanceName);
      
      // Call the QR Code generation API - now returns binary data directly
      const binaryResponse = await apiService.generateQRCode({ 
        instance: instanceName 
      }, 'binary');
      
      // Convert the binary to a data URL
      if (binaryResponse) {
        // Create a data URL from the binary response
        const blob = new Blob([binaryResponse], { type: 'image/png' });
        const qrCodeDataUrl = URL.createObjectURL(blob);
        
        // Create a session object
        const newSession: WhatsAppSession = {
          session: instanceName,
          instanceName: instanceName,
          connected: false,
          qrCode: qrCodeDataUrl,
        };
        
        // Save to state and localStorage
        setSession(newSession);
        localStorage.setItem("whatsapp_session", JSON.stringify(newSession));
        
        return qrCodeDataUrl;
      } else {
        throw new Error("Failed to generate QR code");
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError(err instanceof Error ? err.message : "Failed to generate QR code");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check connection status
  const checkConnection = async (): Promise<boolean> => {
    if (!session) {
      setError("No active WhatsApp session");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Checking connection for instance:", session.instanceName);
      
      const response = await apiService.checkConnection({ 
        instance: session.instanceName 
      });
      
      console.log("Connection check response:", response);
      
      if (response && response.status) {
        const isConnected = response.status === "connected";
        
        // Update session with connection status
        const updatedSession = {
          ...session,
          connected: isConnected,
        };
        
        setSession(updatedSession);
        localStorage.setItem("whatsapp_session", JSON.stringify(updatedSession));
        
        if (isConnected) {
          toast("WhatsApp conectado", {
            description: "Seu WhatsApp está conectado com sucesso!"
          });
          
          // If connected, fetch chats
          await getChats();
        } else {
          toast("WhatsApp não conectado", {
            description: "Por favor, escaneie o QR code novamente."
          });
        }
        
        return isConnected;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error checking connection:", err);
      setError(err instanceof Error ? err.message : "Failed to check connection");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get chats
  const getChats = async (): Promise<WhatsAppChat[]> => {
    if (!session) {
      setError("No active WhatsApp session");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Getting chats for instance:", session.instanceName);
      
      // Call the API to get chats
      const response = await apiService.getChats({ 
        instance: session.instanceName 
      });
      
      console.log("Get chats response:", response);
      
      if (Array.isArray(response)) {
        setChats(response);
        return response;
      } else {
        // If we didn't get chats array, but the request was successful
        // Just return the current chats and don't update
        console.warn("Did not receive chat array from API");
        return chats;
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch chats");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Upload contacts
  const uploadContacts = async (file: File): Promise<boolean> => {
    setLoadingContacts(true);
    try {
      // For demonstration purposes only
      // In a real scenario, this would parse the CSV and send to backend
      console.log("Uploading contacts file:", file.name);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast("Contatos importados", {
        description: "Seus contatos foram importados com sucesso."
      });
      
      // Add additional demo contacts
      const newContacts = [
        ...contacts,
        { id: '4', name: 'Ana Souza', phone: '5511966666666' },
        { id: '5', name: 'Roberto Santos', phone: '5511955555555' },
      ];
      
      setContacts(newContacts);
      return true;
    } catch (err) {
      console.error("Error uploading contacts:", err);
      toast("Erro ao importar contatos", {
        description: "Ocorreu um erro ao importar seus contatos."
      });
      return false;
    } finally {
      setLoadingContacts(false);
    }
  };

  // Send message
  const sendMessage = async (phone: string, message: string): Promise<boolean> => {
    if (!session || !session.connected) {
      toast("WhatsApp não conectado", {
        description: "Conecte seu WhatsApp antes de enviar mensagens."
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Sending message to ${phone}: ${message}`);
      
      // Extract number from remoteJid if needed (removing the @s.whatsapp.net part)
      const phoneNumber = phone.includes('@') ? phone.split('@')[0] : phone;
      
      // Call the API to send message using consistent instance name
      const response = await apiService.sendMessage({
        instance: session.instanceName,
        remoteJid: phoneNumber,
        message: message
      });
      
      console.log("Send message response:", response);
      
      if (response && response.status === "send") {
        toast("Mensagem enviada", {
          description: "Sua mensagem foi enviada com sucesso."
        });
        return true;
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast("Erro ao enviar mensagem", {
        description: "Ocorreu um erro ao enviar sua mensagem."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect session
  const disconnectSession = () => {
    localStorage.removeItem("whatsapp_session");
    setSession(null);
    setChats([]);
  };

  return (
    <WhatsAppContext.Provider
      value={{
        session,
        chats,
        contacts,
        isLoading,
        loadingContacts,
        error,
        generateQRCode,
        checkConnection,
        getChats,
        disconnectSession,
        uploadContacts,
        sendMessage
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};
