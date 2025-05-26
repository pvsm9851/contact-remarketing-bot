export const PLANS = {
  FREE: {
    name: "Free",
    maxContacts: 100,
    maxMessagesPerDay: 50,
    features: [
      "Importação de contatos",
      "Envio de mensagens básicas",
      "Estatísticas básicas"
    ]
  },
  PRO: {
    name: "Pro",
    maxContacts: 1000,
    maxMessagesPerDay: 500,
    features: [
      "Tudo do plano Free",
      "Mensagens personalizadas",
      "Estatísticas avançadas",
      "Suporte prioritário",
      "Intervalos personalizados"
    ]
  },
  BUSINESS: {
    name: "Business",
    maxContacts: 5000,
    maxMessagesPerDay: 2000,
    features: [
      "Tudo do plano Pro",
      "API REST",
      "Múltiplas contas WhatsApp",
      "Webhooks personalizados",
      "Suporte 24/7"
    ]
  }
} as const;

export const MESSAGE_INTERVALS = {
  RAPID: {
    name: "Rápido",
    seconds: 10,
    riskLevel: "high"
  },
  NORMAL: {
    name: "Normal",
    seconds: 30,
    riskLevel: "medium"
  },
  SAFE: {
    name: "Seguro",
    seconds: 60,
    riskLevel: "low"
  },
  ULTRA_SAFE: {
    name: "Ultra Seguro",
    seconds: 120,
    riskLevel: "minimal"
  }
} as const;

export type PlanType = keyof typeof PLANS;
export type IntervalType = keyof typeof MESSAGE_INTERVALS; 