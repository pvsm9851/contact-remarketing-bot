
import React, { createContext, useState, useContext, useEffect } from "react";
import { WhatsAppSession } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

interface WhatsAppContextType {
  session: WhatsAppSession | null;
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<void>;
  checkStatus: () => void;
  resetSession: () => void;
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

  // Check if there's an existing session on mount
  useEffect(() => {
    if (auth.user) {
      const storedSession = localStorage.getItem(`whatsapp_session_${auth.user.id}`);
      if (storedSession) {
        try {
          setSession(JSON.parse(storedSession));
        } catch (e) {
          console.error("Failed to parse stored session", e);
          localStorage.removeItem(`whatsapp_session_${auth.user.id}`);
        }
      }
    }
  }, [auth.user]);

  // Mock API call to create a session
  const createSession = async () => {
    if (!auth.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your N8N backend
      // For now, we'll simulate the API response with a mock
      const timestamp = Date.now();
      const sessionId = `session-${timestamp}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock QR code base64
      const mockQrCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAADZJREFUeJztwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GisgAAFcgHYeAAAAAElFTkSuQmCC";
      
      const newSession: WhatsAppSession = {
        session: sessionId,
        instanceName: sessionId,
        connected: false,
        qrCode: mockQrCode
      };
      
      setSession(newSession);
      localStorage.setItem(`whatsapp_session_${auth.user.id}`, JSON.stringify(newSession));
      
      toast("Sessão criada", {
        description: "Escaneie o código QR para conectar seu WhatsApp.",
      });
      
    } catch (e) {
      console.error("Failed to create WhatsApp session", e);
      setError("Falha ao criar sessão do WhatsApp. Por favor, tente novamente.");
      
      toast("Erro", {
        description: "Falha ao criar sessão do WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = () => {
    if (!session || !auth.user) return;
    
    // In a real app, this would check the session status with your N8N backend
    // For now, we'll simulate a successful connection after scanning
    const updatedSession = {
      ...session,
      connected: true,
    };
    
    setSession(updatedSession);
    localStorage.setItem(`whatsapp_session_${auth.user.id}`, JSON.stringify(updatedSession));
    
    toast("WhatsApp conectado", {
      description: "Seu WhatsApp foi conectado com sucesso!",
    });
  };
  
  const resetSession = () => {
    if (!auth.user) return;
    
    localStorage.removeItem(`whatsapp_session_${auth.user.id}`);
    setSession(null);
    
    toast("Sessão resetada", {
      description: "A conexão com WhatsApp foi desfeita.",
    });
  };

  return (
    <WhatsAppContext.Provider value={{ 
      session, 
      isLoading, 
      error, 
      createSession, 
      checkStatus, 
      resetSession 
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};
