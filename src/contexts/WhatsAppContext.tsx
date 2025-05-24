import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { WhatsAppSession, Contact } from "@/types";
import { apiService } from "@/services/apiService";
import { contactsService } from "@/services/contactsService";
import type { Database } from "@/integrations/supabase/types";
import { notify } from '@/services/notification';
import { supabase } from '@/integrations/supabase/client';

type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];

interface WhatsAppContextType {
  session: WhatsAppSession | null;
  contacts: Contact[];
  importedContacts: ContactInsert[];
  selectedContacts: string[];
  isLoading: boolean;
  loadingContacts: boolean;
  error: string | null;
  generateQRCode: () => Promise<string | null>;
  checkConnection: () => Promise<boolean>;
  disconnectSession: () => void;
  parseContactsFile: (file: File) => Promise<boolean>;
  saveImportedContacts: () => Promise<boolean>;
  clearImportedContacts: () => void;
  sendMessage: (phone: string, message: string) => Promise<boolean>;
  sendBulkMessages: (contacts: Contact[], message: string, intervalSeconds?: number, onProgress?: (progress: number) => void) => Promise<{success: number, failed: number}>;
  toggleContactSelection: (contactId: string) => void;
  clearSelectedContacts: () => void;
  selectAllContacts: () => void;
  clearCache: () => void;
  editContact: (contactId: string, name: string, phone: string) => void;
  deleteContact: (contactId: string) => Promise<void>;
}

export const WhatsAppContext = createContext<WhatsAppContextType | null>(null);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [importedContacts, setImportedContacts] = useState<ContactInsert[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("whatsapp_session");
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        console.log("Loading stored session:", parsedSession);
        
        // Se a sessão estiver marcada como conectada, verifica a conexão
        if (parsedSession.connected) {
          setSession(parsedSession);
          checkConnection().then(isConnected => {
            if (!isConnected) {
              // Se não estiver mais conectado, atualiza a sessão
              const updatedSession = {
                ...parsedSession,
                connected: false
              };
              setSession(updatedSession);
              localStorage.setItem("whatsapp_session", JSON.stringify(updatedSession));
            }
          });
        } else {
          setSession(parsedSession);
        }
      } catch (e) {
        console.error("Failed to parse stored WhatsApp session", e);
        localStorage.removeItem("whatsapp_session");
      }
    }
  }, []);

  // Load contacts from database when auth changes
  useEffect(() => {
    const loadContacts = async () => {
      if (!auth.user?.id) return;

      try {
        const contacts = await contactsService.getContacts();
        setContacts(contacts);
      } catch (error) {
        console.error("Error loading contacts:", error);
        toast.error("Erro ao carregar contatos", {
          description: "Não foi possível carregar seus contatos. Tente novamente mais tarde."
        });
      }
    };

    loadContacts();
  }, [auth.user?.id]);

  // Generate QR Code
  const generateQRCode = async (): Promise<string | null> => {
    if (!auth.user) {
      setError("User not authenticated");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Limpa a sessão atual antes de gerar novo QR
      setSession(prev => ({
        ...prev,
        connected: false,
        qrCode: null
      }));
      
      const response = await apiService.generateQRCode({ instance: auth.user.instance });
      console.log('QR code response in context:', response);
      
      if (response?.base64 && response.base64.startsWith('data:image')) {
        const newSession = {
          session: response.hash || '',
          instanceName: auth.user.instance,
          connected: false,
          qrCode: response.base64
        };
        setSession(newSession);
        localStorage.setItem("whatsapp_session", JSON.stringify(newSession));
        return response.base64;
      } else {
        console.error('Invalid QR code response:', response);
        notify.error('Erro ao gerar QR Code', {
          description: 'O formato do QR code recebido é inválido.'
        });
        return null;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      notify.error('Erro ao gerar QR Code', {
        description: 'Por favor, tente novamente mais tarde.'
      });
      setError(error instanceof Error ? error.message : "Falha ao gerar QR code");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check connection status
  const checkConnection = async (): Promise<boolean> => {
    if (!auth.user?.instance) {
      console.log("Instância do usuário não encontrada");
      setError("Instância do WhatsApp não encontrada");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.checkConnection({ instance: auth.user.instance });
      const connected = response.status === "connected";
      setSession(prev => {
        const newSession = { ...prev, connected };
        localStorage.setItem("whatsapp_session", JSON.stringify(newSession));
        return newSession;
      });
      return connected;
    } catch (error) {
      console.error('Error checking connection:', error);
      notify.error('Erro ao verificar conexão', {
        description: 'Não foi possível verificar o status da conexão.'
      });
      setError(error instanceof Error ? error.message : "Falha ao verificar conexão");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear local storage cache
  const clearCache = () => {
    localStorage.removeItem("whatsapp_session");
    setSession(null);
    setContacts([]);
    setSelectedContacts([]);
    toast.success("Cache limpo", {
      description: "Todas as informações do WhatsApp foram removidas."
    });
  };

  // Parse contacts from file
  const parseContactsFile = async (file: File): Promise<boolean> => {
    if (!auth.user?.id) {
      toast.error("Usuário não autenticado", {
        description: "Faça login para importar contatos."
      });
      return false;
    }

    setLoadingContacts(true);
    try {
      const parsedContacts = await contactsService.parseCSV(file);
      const contacts = parsedContacts.map(contact => ({
        ...contact,
        user_id: auth.user.id
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(contacts);

      if (error) throw error;

      notify.success('Contatos importados', {
        description: `${contacts.length} contatos foram importados com sucesso.`
      });

      setImportedContacts(contacts);
      return true;
    } catch (error) {
      console.error('Error parsing contacts:', error);
      notify.error('Erro ao importar contatos', {
        description: 'Verifique se o arquivo está no formato correto.'
      });
      return false;
    } finally {
      setLoadingContacts(false);
    }
  };

  // Save imported contacts to database
  const saveImportedContacts = async (): Promise<boolean> => {
    if (!auth.user?.id) {
      toast.error("Usuário não autenticado", {
        description: "Faça login para salvar os contatos."
      });
      return false;
    }

    if (importedContacts.length === 0) {
      toast.error("Nenhum contato para salvar", {
        description: "Importe contatos primeiro antes de salvá-los."
      });
      return false;
    }

    try {
      // Cria um mapa de números de telefone existentes
      const existingPhones = new Map(
        contacts.map(contact => [contact.phone, { id: contact.id, name: contact.name }])
      );

      // Separa contatos novos e atualizações
      const newContacts: ContactInsert[] = [];
      const updates: { id: string; name: string }[] = [];

      importedContacts.forEach(contact => {
        const existing = existingPhones.get(contact.phone);
        if (existing) {
          // Se o nome for diferente, adiciona à lista de atualizações
          if (existing.name !== contact.name) {
            updates.push({ id: existing.id, name: contact.name });
          }
        } else {
          newContacts.push(contact);
        }
      });

      // Processa as atualizações
      if (updates.length > 0) {
        for (const update of updates) {
          await contactsService.updateContact(update.id, { name: update.name });
        }
      }

      // Salva os novos contatos
      if (newContacts.length > 0) {
        const savedContacts = await contactsService.createBulkContacts(newContacts);
        setContacts(prevContacts => [...prevContacts, ...savedContacts]);
      }

      // Limpa os contatos importados
      setImportedContacts([]);
      
      // Mostra mensagem de sucesso
      toast.success("Contatos processados", {
        description: `${newContacts.length} novos contatos salvos e ${updates.length} contatos atualizados.`
      });
      
      return true;
    } catch (error) {
      console.error("Error saving contacts:", error);
      toast.error("Erro ao salvar contatos", {
        description: "Não foi possível salvar os contatos. Tente novamente mais tarde."
      });
      return false;
    }
  };

  // Clear imported contacts
  const clearImportedContacts = () => {
    setImportedContacts([]);
    toast.success("Contatos importados descartados", {
      description: "Os contatos importados foram descartados sem serem salvos."
    });
  };

  // Send message to a single contact
  const sendMessage = async (phone: string, message: string): Promise<boolean> => {
    if (!auth.user?.instance) {
      toast.error("WhatsApp não configurado", {
        description: "Configuração da instância não encontrada."
      });
      return false;
    }

    try {
      console.log(`Enviando mensagem para ${phone}: ${message}`);
      
      // Limpa o número de telefone
      let formattedPhone = phone.replace(/\D/g, '');
      
      // Converte notação científica se necessário
      if (formattedPhone.includes('E') || formattedPhone.includes('e')) {
        formattedPhone = Number(formattedPhone).toFixed(0);
      }
      
      // Valida o formato do número
      if (!/^55\d{10,11}$/.test(formattedPhone)) {
        console.error("Número inválido:", formattedPhone);
        return false;
      }
      
      console.log("Número formatado para API:", formattedPhone);
      
      // Call the API to send message using user's instance
      const response = await apiService.sendMessage(
        auth.user.instance,
        formattedPhone,
        message
      );
      
      // A API retorna status "send" quando a mensagem é enviada com sucesso
      if (response?.key?.remoteJid) {
        console.log("Mensagem enviada com sucesso:", response);
        return true;
      } else {
        console.error("Resposta inesperada da API:", response);
        return false;
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      return false;
    }
  };

  // Edit contact
  const editContact = async (contactId: string, name: string, phone: string) => {
    try {
      const updatedContact = await contactsService.updateContact(contactId, { name, phone });
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId ? updatedContact : contact
        )
      );
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Erro ao atualizar contato", {
        description: "Não foi possível atualizar o contato. Tente novamente mais tarde."
      });
    }
  };

  // Send message to multiple contacts
  const sendBulkMessages = async (
    contacts: Contact[], 
    message: string, 
    intervalSeconds: number = 10,
    onProgress?: (progress: number) => void
  ): Promise<{success: number, failed: number}> => {
    if (!auth.user?.instance) {
      toast.error("WhatsApp não configurado", {
        description: "Configuração da instância não encontrada."
      });
      return { success: 0, failed: 0 };
    }
    
    const results = {
      success: 0,
      failed: 0
    };
    
    setIsLoading(true);
    
    try {
      console.log("Iniciando envio em massa para", contacts.length, "contatos");
      console.log("Intervalo entre mensagens:", intervalSeconds, "segundos");
      
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        try {
          console.log("Enviando para", contact.name, "em", contact.phone);
          const sent = await sendMessage(contact.phone, message);
          if (sent) {
            results.success++;
            console.log("Mensagem enviada com sucesso para", contact.name);
          } else {
            results.failed++;
            console.log("Falha ao enviar mensagem para", contact.name);
          }
        } catch (err) {
          console.error(`Falha ao enviar mensagem para ${contact.name}:`, err);
          results.failed++;
        }
        
        // Calcula e atualiza o progresso
        const progress = ((i + 1) / contacts.length) * 100;
        onProgress?.(progress);
        
        // Aguarda o intervalo especificado entre as mensagens
        if (i < contacts.length - 1) {
          console.log(`Aguardando ${intervalSeconds} segundos antes da próxima mensagem...`);
          await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
        }
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
      console.error("Erro no envio em massa:", err);
      toast.error("Erro ao enviar mensagens em massa", {
        description: "Ocorreu um erro ao processar o envio de mensagens."
      });
      return { success: results.success, failed: results.failed };
    } finally {
      setIsLoading(false);
      onProgress?.(100); // Garante que a barra de progresso chegue ao fim
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
    const allContactIds = contacts.map(contact => contact.id);
    setSelectedContacts(allContactIds);
  };

  // Disconnect session
  const disconnectSession = () => {
    localStorage.removeItem("whatsapp_session");
    setSession(null);
  };

  // Delete contact
  const deleteContact = async (contactId: string) => {
    try {
      await contactsService.deleteContact(contactId);
      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Erro ao excluir contato", {
        description: "Não foi possível excluir o contato. Tente novamente mais tarde."
      });
    }
  };

  return (
    <WhatsAppContext.Provider
      value={{
        session,
        contacts,
        importedContacts,
        selectedContacts,
        isLoading,
        loadingContacts,
        error,
        generateQRCode,
        checkConnection,
        disconnectSession,
        parseContactsFile,
        saveImportedContacts,
        clearImportedContacts,
        sendMessage,
        sendBulkMessages,
        toggleContactSelection,
        clearSelectedContacts,
        selectAllContacts,
        clearCache,
        editContact,
        deleteContact
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
}

// Export the hook separately after the provider
export function useWhatsApp() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  }
  return context;
}
