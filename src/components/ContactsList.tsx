import { useState } from "react";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Contact } from "@/types/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Save, X } from "lucide-react";
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
    clearSelectedContacts
  } = useWhatsApp();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Wrapper para saveImportedContacts
  const handleSaveImportedContacts = async () => {
    return await saveImportedContacts();
  };

  return (
    <div className="space-y-8">
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

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="bg-gray-900 border-gray-700 text-gray-100"
              />
              <p className="text-xs text-gray-400">
                Formato: 55 + DDD + número (ex: 5511999887766)
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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