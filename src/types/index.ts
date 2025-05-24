export interface User {
  id: string;
  email: string;
  name: string;
  instance: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Stats {
  id: string;
  user_id: string;
  total_messages_sent: number;
  total_messages_failed: number;
  created_at: string;
}

export interface StatsContextType {
  stats: Stats | null;
  isLoading: boolean;
  incrementMessagesSent: (amount?: number) => Promise<void>;
  incrementMessagesFailed: (amount?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  createNewStatsEntry: (updates: Partial<Stats>) => Promise<void>;
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

// Re-export types from whatsapp.ts
export * from './whatsapp';
