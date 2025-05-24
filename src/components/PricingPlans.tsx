import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PricingPlansProps {
  showAuthButtons?: boolean;
}

const plans = [
  {
    id: 'bd126c79-free',
    name: 'Free',
    description: 'Plano gratuito com recursos básicos',
    price: 0,
    interval: 'monthly',
    features: [
      'Conexão com WhatsApp',
      'Gerenciamento de contatos',
      'Envio de mensagens'
    ],
    limits: {
      contacts: 100,
      messages_per_month: 500
    }
  },
  {
    id: '0885302f-pro',
    name: 'Pro',
    description: 'Plano profissional com recursos avançados',
    price: 49.90,
    interval: 'monthly',
    features: [
      'Conexão com WhatsApp',
      'Gerenciamento de contatos',
      'Envio de mensagens',
      'Importação CSV',
      'Estatísticas avançadas',
      'Suporte prioritário'
    ],
    limits: {
      contacts: 1000,
      messages_per_month: 5000
    }
  },
  {
    id: '65b8e641-business',
    name: 'Business',
    description: 'Plano empresarial com recursos ilimitados',
    price: 99.90,
    interval: 'monthly',
    features: [
      'Conexão com WhatsApp',
      'Gerenciamento de contatos',
      'Envio de mensagens',
      'Importação CSV',
      'Estatísticas avançadas',
      'Suporte prioritário',
      'API de integração',
      'Múltiplas conexões'
    ],
    limits: {
      contacts: 5000,
      messages_per_month: 50000
    }
  }
];

export const PricingPlans: React.FC<PricingPlansProps> = ({ showAuthButtons = false }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const handlePlanSelect = (planId: string) => {
    if (!auth.user) {
      navigate('/login');
    } else {
      navigate('/planos');
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
              </span>
              <span className="text-gray-400 ml-2">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>{feature}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-500" />
                <span>{plan.limits.contacts.toLocaleString()} contatos</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-500" />
                <span>{plan.limits.messages_per_month.toLocaleString()} mensagens/mês</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {showAuthButtons ? (
              <Button
                className="w-full"
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.price === 0 ? 'Começar Agora' : 'Selecionar Plano'}
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={plan.price === 0 ? "default" : "outline"}
                onClick={() => navigate('/register')}
              >
                Criar Conta Grátis
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}; 