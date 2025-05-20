
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { WhatsAppSession, WhatsAppChat } from "@/types";
import { apiService } from "@/services/apiService";

interface WhatsAppContextType {
  session: WhatsAppSession | null;
  chats: WhatsAppChat[];
  isLoading: boolean;
  error: string | null;
  generateQRCode: () => Promise<string | null>;
  checkConnection: () => Promise<boolean>;
  getChats: () => Promise<WhatsAppChat[]>;
  disconnectSession: () => void;
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
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("whatsapp_session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      } catch (e) {
        console.error("Failed to parse stored WhatsApp session", e);
        localStorage.removeItem("whatsapp_session");
      }
    }
  }, []);

  // Generate QR Code
  const generateQRCode = async (): Promise<string | null> => {
    if (!auth.user) {
      setError("User not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get instance ID from user
      const sessionTimestamp = Date.now();
      const instanceName = `session-${sessionTimestamp}`;
      
      console.log("Generating QR code for instance:", instanceName);
      
      // Call the QR Code generation API
      const response = await apiService.generateQRCode({ instance: instanceName });
      console.log("QR Code response:", response);
      
      if (response && response.image) {
        // Create a session object
        const newSession: WhatsAppSession = {
          session: instanceName,
          instanceName: instanceName,
          connected: false,
          qrCode: response.image,
        };
        
        // Save to state and localStorage
        setSession(newSession);
        localStorage.setItem("whatsapp_session", JSON.stringify(newSession));
        
        return response.image;
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
            description: "Seu WhatsApp está conectado com sucesso!",
          });
          
          // If connected, fetch chats
          await getChats();
        } else {
          toast("WhatsApp não conectado", {
            description: "Por favor, escaneie o QR code novamente.",
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
        isLoading,
        error,
        generateQRCode,
        checkConnection,
        getChats,
        disconnectSession
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};
