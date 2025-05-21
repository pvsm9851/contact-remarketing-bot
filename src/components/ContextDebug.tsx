
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

const ContextDebug: React.FC = () => {
  const isAuthAvailable = (() => {
    try {
      const auth = useAuth();
      return !!auth;
    } catch (e) {
      return false;
    }
  })();

  const isWhatsAppAvailable = (() => {
    try {
      const whatsApp = useWhatsApp();
      return !!whatsApp;
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-xs z-50">
      <div>Auth Context: {isAuthAvailable ? '✅' : '❌'}</div>
      <div>WhatsApp Context: {isWhatsAppAvailable ? '✅' : '❌'}</div>
    </div>
  );
};

export default ContextDebug;
