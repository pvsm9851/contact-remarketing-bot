import { supabase } from "@/integrations/supabase/client-browser";
import type { Database } from "@/integrations/supabase/types";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

export const contactsService = {
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }

    return data || [];
  },

  async createContact(contact: ContactInsert): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw error;
    }

    return data;
  },

  async updateContact(id: string, updates: ContactUpdate): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    return data;
  },

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  async createBulkContacts(contacts: ContactInsert[]): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contacts)
      .select();

    if (error) {
      console.error('Error creating bulk contacts:', error);
      throw error;
    }

    return data || [];
  },

  async parseCSV(file: File): Promise<Pick<ContactInsert, 'name' | 'phone'>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].toLowerCase().split(',');
          
          const nameIndex = headers.findIndex(h => h.trim() === 'nome');
          const phoneIndex = headers.findIndex(h => h.trim() === 'telefone');
          
          if (nameIndex === -1 || phoneIndex === -1) {
            throw new Error('CSV deve conter as colunas: nome, telefone');
          }

          const contacts: Pick<ContactInsert, 'name' | 'phone'>[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const name = values[nameIndex];
            let phone = values[phoneIndex];
            
            // Handle scientific notation
            if (phone.includes('E') || phone.includes('e')) {
              phone = Number(phone).toFixed(0);
            }
            
            // Clean phone number
            phone = phone.replace(/\D/g, '');
            
            // Validate phone number
            if (!/^55\d{10,11}$/.test(phone)) {
              if (/^\d{10,11}$/.test(phone)) {
                phone = '55' + phone;
              } else {
                console.warn(`Número inválido na linha ${i + 1}: ${phone}`);
                continue;
              }
            }
            
            contacts.push({ name, phone });
          }
          
          resolve(contacts);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}; 