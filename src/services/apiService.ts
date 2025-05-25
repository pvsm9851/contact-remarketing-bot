/**
 * Service for handling API calls to N8N webhooks
 */

import axios from "axios";

// Base URLs
const N8N_WEBHOOK_BASE_URL = "https://editor.mavicmkt.com.br";
const N8N_WEBHOOK_TEST_BASE_URL = "https://editor.mavicmkt.com.br/webhook-test";
const EVOLUTION_API_URL = "https://api.mavicmkt.com.br";
const EVOLUTION_API_KEY = "c87ea0c8c68239cc4c7a001f960efbca";

// Webhook IDs 
const WEBHOOKS = {
  NEW_USER: "5c3cdd33-7a18-4b6a-b3ed-0b4e5a273c18",
  QRCODE_GENERATE: "28bebbde-21e9-405d-be7f-e724638be60f",
  CHECK_CONNECTION: "b66aa268-0ce8-4e95-9d31-23e8fba992ea",
  SEND_MESSAGE: "f26fffa6-0ac5-4e56-b88b-e043c055378a",
};

// Helper function to build webhook URL
const buildWebhookUrl = (webhookId: string, isTest: boolean = false): string => {
  const baseUrl = isTest ? N8N_WEBHOOK_TEST_BASE_URL : `${N8N_WEBHOOK_BASE_URL}/webhook`;
  return `${baseUrl}/${webhookId}`;
};

interface WhatsAppResponse {
  status: string;
  message?: string;
}

interface SendMessageParams {
  instance: string;
  remoteJid: string;
  message: string;
}

interface CheckConnectionParams {
  instance: string;
}

interface GenerateQRCodeParams {
  instance: string;
}

interface CreateInstanceParams {
  instanceName: string;
  qrcode: boolean;
  integration: string;
}

interface ConnectionState {
  instance: {
    instanceName: string;
    state: string;
  };
}

interface QRCodeResponse {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

interface CreateInstanceResponse {
  hash: string;
  instance: {
    instanceName: string;
    status: string;
  };
}

interface SendMessageResponse {
  key: {
    id: string;
    remoteJid: string;
  };
  status: string;
}

const api = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    "Content-Type": "application/json",
    "apikey": EVOLUTION_API_KEY
  }
});

// API methods
export const apiService = {
  // Create Evolution API Instance
  async createInstance(instanceName: string): Promise<CreateInstanceResponse> {
    try {
      const response = await api.post("/instance/create", {
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      });
      return response.data;
    } catch (error: any) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  },

  // Delete Evolution API Instance
  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await api.delete(`/instance/delete/${instanceName}`);
    } catch (error) {
      console.error("Error deleting instance:", error);
      throw error;
    }
  },

  // Register new user
  async registerUser(userData: any): Promise<any> {
    const response = await api.post("/users/register", userData);
    return response.data;
  },
  
  // Generate QR Code
  async generateQRCode(params: GenerateQRCodeParams): Promise<any> {
    try {
      console.log('Requesting QR code for instance:', params.instance);
      const response = await api.get(`/instance/connect/${params.instance}`);
      console.log('QR code generation response:', response.data);
      
      // Se a instância estiver em estado connecting, vamos tentar desconectar primeiro
      if (response.data?.instance?.state === 'connecting') {
        console.log('Instance is in connecting state, trying to disconnect first');
        await api.delete(`/instance/logout/${params.instance}`);
        // Aguarda um momento e tenta gerar o QR novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryResponse = await api.get(`/instance/connect/${params.instance}`);
        console.log('QR code retry response:', retryResponse.data);
        return retryResponse.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },
  
  // Check connection status
  async checkConnection(params: CheckConnectionParams): Promise<WhatsAppResponse> {
    const response = await api.get(`/instance/connectionState/${params.instance}`);
    console.log('Evolution API connection response:', response.data);
    return {
      status: response.data?.instance?.state === "open" ? "connected" : "disconnected"
    };
  },
  
  // Send message
  async sendMessage(instance: string, number: string, text: string): Promise<SendMessageResponse> {
    const response = await api.post(`/message/sendText/${instance}`, {
      number,
      text
    });
    return response.data;
  },

  async get<T>(endpoint: string): Promise<T> {
    const response = await api.get<T>(endpoint);
    return response.data;
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  }
};
