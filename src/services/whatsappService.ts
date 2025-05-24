import { apiService } from "./apiService";

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

export const whatsappService = {
  async checkConnection(instance: string): Promise<boolean> {
    try {
      const response = await apiService.get<ConnectionState>(`/instance/connectionState/${instance}`);
      console.log("Connection response:", response);
      return response?.instance?.state === "open";
    } catch (error) {
      console.error("Error checking WhatsApp connection:", error);
      return false;
    }
  },

  async generateQRCode(instance: string): Promise<string | null> {
    try {
      console.log("Generating QR code for instance:", instance);
      const response = await apiService.get<QRCodeResponse>(`/instance/connect/${instance}`);
      console.log("QR code response:", response);
      
      if (!response?.base64?.startsWith('data:image')) {
        console.error("Invalid QR code response format:", response);
        return null;
      }

      return response.base64;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  }
}; 