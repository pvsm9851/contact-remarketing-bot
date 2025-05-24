import { useContext } from 'react';
import { WhatsAppContext } from '@/contexts/WhatsAppContext';

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}; 