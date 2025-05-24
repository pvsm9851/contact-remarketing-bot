import { useState } from "react";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { useStats } from "@/contexts/StatsContext";
import { Contact } from "@/types/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Save, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ContactsList() {
  const { 
    contacts, 
    importedContacts, 
    editContact, 
    deleteContact,
    saveImportedContacts,
    clearImportedContacts,
    selectedContacts,
    toggleContactSelection,
    selectAllContacts,
    clearSelectedContacts,
    sendBulkMessages
  } = useWhatsApp();
  const { stats, incrementMessagesSent, incrementMessagesFailed } = useStats();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingContact) return;

    // Validação do número de telefone
    const cleanPhone = editPhone.replace(/\D/g, '');
    if (!/^55\d{10,11}$/.test(cleanPhone)) {
      toast.error("Número de telefone inválido", {
        description: "O número deve estar no formato: 55 + DDD + número (ex: 5511999887766)"
      });
      return;
    }

    editContact(editingContact.id, editName, cleanPhone);
    setIsDialogOpen(false);
    setEditingContact(null);
    toast.success("Contato atualizado", {
      description: "As informações do contato foram atualizadas com sucesso."
    });
  };

  const handleSendMessages = async () => {
    if (selectedContacts.length === 0) {
      toast.error("Nenhum contato selecionado", {
        description: "Selecione pelo menos um contato para enviar a mensagem."
      });
      return;
    }

    if (!message.trim()) {
      toast.error("Mensagem vazia", {
        description: "Digite uma mensagem para enviar."
      });
      return;
    }

    if (intervalSeconds < 10) {
      toast.error("Intervalo muito curto", {
        description: "O intervalo mínimo entre mensagens é de 10 segundos."
      });
      return;
    }

    setIsSending(true);
    try {
      const selectedContactsList = contacts.filter(contact => 
        selectedContacts.includes(contact.id)
      );

      const result = await sendBulkMessages(
        selectedContactsList, 
        message.trim(), 
        intervalSeconds,
        (progress) => setProgress(progress)
      );
      
      // Atualizar estatísticas
      if (result.success > 0) {
        await incrementMessagesSent(result.success);
      }
      
      if (result.failed > 0) {
        await incrementMessagesFailed(result.failed);
      }

      if (result.success > 0) {
        setMessage("");
        clearSelectedContacts();
      }
    } finally {
      setIsSending(false);
      setProgress(0);
    }
  };

  // Wrapper para saveImportedContacts
  const handleSaveImportedContacts = async () => {
    return await saveImportedContacts();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna da esquerda - Lista de Contatos */}
      <div className="lg:col-span-2 space-y-8">
        {/* Contatos Importados */}
        {importedContacts.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Contatos Importados</h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveImportedContacts}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Contatos
                </Button>
                <Button
                  variant="outline"
                  onClick={clearImportedContacts}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Descartar
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {importedContacts.map((contact, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contatos Salvos */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Contatos Salvos</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={selectAllContacts}
                className="text-sm"
              >
                Selecionar Todos
              </Button>
              {selectedContacts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearSelectedContacts}
                  className="text-sm"
                >
                  Limpar Seleção
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map(contact => (
              <Card key={contact.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleContactSelection(contact.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteContact(contact.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna da direita - Envio de Mensagens */}
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Enviar Mensagem</h2>
              {selectedContacts.length > 0 && (
                <div className="p-3 bg-gray-700 rounded-md mb-4">
                  <p className="text-sm font-medium text-gray-200">
                    {selectedContacts.length} contatos selecionados
                  </p>
                  {selectedContacts.length <= 5 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedContacts.map((contactId) => {
                        const contact = contacts.find(c => c.id === contactId);
                        return contact ? (
                          <div 
                            key={contactId} 
                            className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-200"
                          >
                            {contact.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 mt-1">
                      {contacts.find(c => c.id === selectedContacts[0])?.name}, 
                      {contacts.find(c => c.id === selectedContacts[1])?.name} e mais 
                      {selectedContacts.length - 2} contatos
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[120px] bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="interval" className="text-sm font-medium">
                  Intervalo entre mensagens (segundos)
                </label>
                <Input
                  id="interval"
                  type="number"
                  min={10}
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                  className="bg-gray-900 border-gray-700 text-gray-100"
                />
                <p className="text-xs text-gray-400">
                  Mínimo de 10 segundos entre cada mensagem
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleSendMessages}
                className="w-full gap-2"
                disabled={selectedContacts.length === 0 || !message.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
              
              {isSending && (
                <Progress value={progress} className="w-full" />
              )}
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <Input
                id="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="5511999887766"
              />
              <p className="text-xs text-muted-foreground">
                Formato: 55 + DDD + número (ex: 5511999887766)
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 