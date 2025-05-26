import { http, HttpResponse } from 'msw';

interface MessageRequest {
  contactId: string;
  message: string;
  scheduledFor?: string;
  templateId?: string;
}

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'fake-jwt-token',
    });
  }),

  // WhatsApp handlers
  http.get('/api/whatsapp/status', () => {
    return HttpResponse.json({
      connected: true,
      qrCode: null,
    });
  }),

  http.post('/api/whatsapp/generate-qr', () => {
    return HttpResponse.json({
      qrCode: 'data:image/png;base64,fake-qr-code',
    });
  }),

  // Contacts handlers
  http.get('/api/contacts', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe', phone: '5511999887766' },
      { id: 2, name: 'Jane Smith', phone: '5511987654321' }
    ]);
  }),

  // Messages handlers
  http.post('/api/messages', async ({ request }) => {
    const data = await request.json() as MessageRequest;
    return HttpResponse.json({ 
      id: 1, 
      ...data, 
      status: 'queued',
      createdAt: new Date().toISOString()
    });
  }),

  // Stats handlers
  http.get('/api/stats', () => {
    return HttpResponse.json({
      totalMessagesSent: 100,
      totalMessagesFailed: 5,
      successRate: 95,
    });
  }),
]; 