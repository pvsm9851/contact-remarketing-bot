import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { toast } from "sonner";

interface RedirectIfWhatsAppConnectedProps {
  children: React.ReactNode;
}

const RedirectIfWhatsAppConnected: React.FC<RedirectIfWhatsAppConnectedProps> = ({ children }) => {
  const { session, checkConnection } = useWhatsApp();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyConnection = async () => {
      if (session?.connected) {
        const isConnected = await checkConnection();
        if (isConnected) {
          toast.info("WhatsApp já está conectado", {
            description: "Você será redirecionado para o dashboard."
          });
          navigate("/contatos");
        }
      }
    };

    verifyConnection();
  }, [session?.connected, checkConnection, navigate]);

  return <>{children}</>;
};

export default RedirectIfWhatsAppConnected; 