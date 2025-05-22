
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { WhatsAppSession, Contact } from "@/types";
import { apiService } from "@/services/apiService";

interface WhatsAppContextType {
  session: WhatsAppSession | null;
  contacts: Contact[];
  selectedContacts: string[];
  isLoading: boolean;
  loadingContacts: boolean;
  error: string | null;
  generateQRCode: () => Promise<string | null>;
  checkConnection: () => Promise<boolean>;
  disconnectSession: () => void;
  uploadContacts: (file: File) => Promise<boolean>;
  sendMessage: (phone: string, message: string) => Promise<boolean>;
  sendBulkMessages: (contacts: Contact[], message: string) => Promise<{success: number, failed: number}>;
  toggleContactSelection: (contactId: string) => void;
  clearSelectedContacts: () => void;
  selectAllContacts: () => void;
  clearCache: () => void;
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
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
    
    // Load demo contacts from localStorage if available
    const storedContacts = localStorage.getItem("whatsapp_contacts");
    if (storedContacts) {
      try {
        setContacts(JSON.parse(storedContacts));
      } catch (e) {
        console.error("Failed to parse stored contacts", e);
      }
    } else {
      // Set empty contacts array if nothing stored
      setContacts([]);
    }
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
      
      // Call the QR Code generation API - returns binary data directly
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
        localStorage.setItem("whatsapp_instance", instanceName);
        
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

  // Clear local storage cache
  const clearCache = () => {
    localStorage.removeItem("whatsapp_session");
    localStorage.removeItem("whatsapp_contacts");
    localStorage.removeItem("whatsapp_instance");
    setSession(null);
    setContacts([]);
    setSelectedContacts([]);
    toast.success("Cache limpo", {
      description: "Todas as informações do WhatsApp foram removidas."
    });
  };

  // Upload contacts
  const uploadContacts = async (file: File): Promise<boolean> => {
    setLoadingContacts(true);
    try {
      // Parse CSV file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const nameIndex = headers.findIndex(h => h.trim().toLowerCase() === 'nome');
      const phoneIndex = headers.findIndex(h => h.trim().toLowerCase() === 'telefone');
      
      if (nameIndex === -1 || phoneIndex === -1) {
        throw new Error("Formato inválido: o CSV deve conter colunas 'nome' e 'telefone'");
      }
      
      const parsedContacts: Contact[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        if (values.length >= Math.max(nameIndex, phoneIndex) + 1) {
          const contact: Contact = {
            id: `contact-${i}`,
            name: values[nameIndex].trim(),
            phone: values[phoneIndex].trim(),
          };
          parsedContacts.push(contact);
        }
      }
      
      if (parsedContacts.length === 0) {
        throw new Error("Nenhum contato válido encontrado no arquivo");
      }
      
      // Store contacts in state and localStorage
      setContacts(parsedContacts);
      localStorage.setItem("whatsapp_contacts", JSON.stringify(parsedContacts));
      
      toast("Contatos importados", {
        description: `${parsedContacts.length} contatos foram importados com sucesso.`
      });
      
      return true;
    } catch (err) {
      console.error("Error uploading contacts:", err);
      toast.error("Erro ao importar contatos", {
        description: err instanceof Error ? err.message : "Ocorreu um erro ao importar seus contatos."
      });
      return false;
    } finally {
      setLoadingContacts(false);
    }
  };

  // Send message to a single contact
  const sendMessage = async (phone: string, message: string): Promise<boolean> => {
    if (!session || !session.connected) {
      toast.error("WhatsApp não conectado", {
        description: "Conecte seu WhatsApp antes de enviar mensagens."
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log(`Sending message to ${phone}: ${message}`);
      
      // Extract number from remoteJid if needed (removing the @s.whatsapp.net part)
      const phoneNumber = phone.includes('@') ? phone.split('@')[0] : phone;
      
      // Ensure we're handling scientific notation (convert to full number string)
      let formattedPhone = phoneNumber;
      if (phoneNumber.includes('E+')) {
        formattedPhone = Number(phoneNumber).toString();
      }
      
      console.log("Formatted phone for API call:", formattedPhone);
      
      // Call the API to send message using consistent instance name
      const response = await apiService.sendMessage({
        instance: session.instanceName,
        remoteJid: formattedPhone,
        message: message
      });
      
      console.log("Send message response:", response);
      
      if (response && response.status === "send") {
        toast.success("Mensagem enviada", {
          description: "Sua mensagem foi enviada com sucesso."
        });
        return true;
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Erro ao enviar mensagem", {
        description: "Ocorreu um erro ao enviar sua mensagem."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to multiple contacts
  const sendBulkMessages = async (contacts: Contact[], message: string): Promise<{success: number, failed: number}> => {
    if (!session || !session.connected) {
      toast.error("WhatsApp não conectado", {
        description: "Conecte seu WhatsApp antes de enviar mensagens."
      });
      return { success: 0, failed: 0 };
    }
    
    const results = {
      success: 0,
      failed: 0
    };
    
    setIsLoading(true);
    
    try {
      console.log("Starting bulk message sending to", contacts.length, "contacts");
      
      for (const contact of contacts) {
        try {
          console.log("Sending to", contact.name, "at", contact.phone);
          const sent = await sendMessage(contact.phone, message);
          if (sent) {
            results.success++;
          } else {
            results.failed++;
          }
        } catch (err) {
          console.error(`Failed to send message to ${contact.name}:`, err);
          results.failed++;
        }
        
        // Add a small delay between messages to prevent throttling
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const totalAttempted = results.success + results.failed;
      
      if (results.success === totalAttempted) {
        toast.success(`Mensagens enviadas com sucesso`, {
          description: `Todas as ${results.success} mensagens foram enviadas.`
        });
      } else if (results.success > 0 && results.failed > 0) {
        toast.warning(`Envio de mensagens parcial`, {
          description: `${results.success} mensagens enviadas, ${results.failed} falharam.`
        });
      } else {
        toast.error(`Falha no envio de mensagens`, {
          description: `Nenhuma das ${results.failed} mensagens foi enviada.`
        });
      }
      
      return results;
    } catch (err) {
      console.error("Error in bulk message sending:", err);
      toast.error("Erro ao enviar mensagens em massa", {
        description: "Ocorreu um erro ao processar o envio de mensagens."
      });
      return { success: results.success, failed: results.failed };
    } finally {
      setIsLoading(false);
    }
  };

  // Contact selection functions
  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const clearSelectedContacts = () => {
    setSelectedContacts([]);
  };

  const selectAllContacts = () => {
    setSelectedContacts(contacts.map(contact => contact.id));
  };

  // Disconnect session
  const disconnectSession = () => {
    localStorage.removeItem("whatsapp_session");
    setSession(null);
  };

  return (
    <WhatsAppContext.Provider
      value={{
        session,
        contacts,
        selectedContacts,
        isLoading,
        loadingContacts,
        error,
        generateQRCode,
        checkConnection,
        disconnectSession,
        uploadContacts,
        sendMessage,
        sendBulkMessages,
        toggleContactSelection,
        clearSelectedContacts,
        selectAllContacts,
        clearCache
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};
