import type { Database } from "@/integrations/supabase/types";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export interface WhatsAppSession {
  session: string;
  instanceName: string;
  connected: boolean;
  qrCode?: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
} 