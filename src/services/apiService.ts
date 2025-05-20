
/**
 * Service for handling API calls to N8N webhooks
 */

// Base URLs
const N8N_WEBHOOK_BASE_URL = "https://webhook.mavicmkt.com.br/webhook";

// Webhook IDs 
const WEBHOOKS = {
  NEW_USER: "5c3cdd33-7a18-4b6a-b3ed-0b4e5a273c18",
  QRCODE_GENERATE: "28bebbde-21e9-405d-be7f-e724638be60f",
  CHECK_CONNECTION: "b66aa268-0ce8-4e95-9d31-23e8fba992ea",
  GET_CHATS: "d2558660-69f3-470e-82af-1d57266790b8",
};

// Helper function to build webhook URL
const buildWebhookUrl = (webhookId: string): string => {
  return `${N8N_WEBHOOK_BASE_URL}/${webhookId}`;
};

// API methods
export const apiService = {
  // Register new user
  registerUser: async (userData: any) => {
    try {
      const response = await fetch(buildWebhookUrl(WEBHOOKS.NEW_USER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },
  
  // Generate QR Code
  generateQRCode: async (instanceData: { instance: string }) => {
    try {
      const response = await fetch(buildWebhookUrl(WEBHOOKS.QRCODE_GENERATE), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instanceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  },
  
  // Check connection status
  checkConnection: async (instanceData: { instance: string }) => {
    try {
      const response = await fetch(buildWebhookUrl(WEBHOOKS.CHECK_CONNECTION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instanceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error checking connection:", error);
      throw error;
    }
  },
  
  // Get chats
  getChats: async (instanceData: { instance: string }) => {
    try {
      const response = await fetch(buildWebhookUrl(WEBHOOKS.GET_CHATS), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instanceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // The GET_CHATS endpoint might not return JSON
      // but we need to handle the response based on what we expect
      try {
        return await response.json();
      } catch (e) {
        // If it's not JSON, just return the status
        return { status: "success" };
      }
    } catch (error) {
      console.error("Error getting chats:", error);
      throw error;
    }
  },
};
