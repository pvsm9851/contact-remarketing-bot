
export interface User {
  id: string;
  email: string;
  phone: string; // Keeping for compatibility
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  lastContact?: string;
}

export interface Message {
  id: string;
  content: string;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
}

export interface WhatsAppSession {
  session: string;
  instanceName: string;
  connected: boolean;
  qrCode?: string | null;
}

// Removed WhatsAppChat interface since we're not using chat functionality anymore
