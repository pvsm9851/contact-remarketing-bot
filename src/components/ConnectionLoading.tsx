import React from 'react';
import { Loader2 } from 'lucide-react';

const ConnectionLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
        <p className="text-gray-300">Verificando conexão com WhatsApp...</p>
      </div>
    </div>
  );
};

export default ConnectionLoading; 