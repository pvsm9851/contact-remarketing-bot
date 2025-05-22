
/**
 * Service for handling API calls to N8N webhooks
 */

// Base URLs
const N8N_WEBHOOK_BASE_URL = "https://editor.mavicmkt.com.br";
const N8N_WEBHOOK_TEST_BASE_URL = "https://editor.mavicmkt.com.br/webhook-test";

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
  
  // Generate QR Code - now with option to return binary data
  generateQRCode: async (instanceData: { instance: string }, responseType: 'json' | 'binary' = 'json') => {
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
      
      // Return binary data or JSON based on responseType
      if (responseType === 'binary') {
        return await response.arrayBuffer();
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  },
  
  // Check connection status - using GET with query parameters
  checkConnection: async (instanceData: { instance: string }) => {
    try {
      // Build the URL with the instance as a query parameter for GET request
      const url = `${buildWebhookUrl(WEBHOOKS.CHECK_CONNECTION)}?instance=${instanceData.instance}`;
      console.log("Checking connection with URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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
  
  // Send message - now properly using the webhook-test URL for SEND_MESSAGE webhook
  sendMessage: async (messageData: { instance: string, remoteJid: string, message: string }) => {
    try {
      console.log("Sending message data:", messageData);
      
      // Make sure we're using the correct webhook URL for sending messages
      const response = await fetch(buildWebhookUrl(WEBHOOKS.SEND_MESSAGE, true), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};
