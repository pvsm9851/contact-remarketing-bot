import React from 'react';
import { CustomHeader } from '@/components/CustomHeader';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Plans: React.FC = () => {
  const { currentPlan, subscription, subscribeToPlan, cancelSubscription, isLoading } = useSubscription();

  const handleSubscribe = async (planId: string) => {
    try {
      toast.loading('Processando assinatura...');
      await subscribeToPlan(planId);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast.error('Erro ao assinar plano', {
        description: 'Houve um problema ao processar sua assinatura. Por favor, tente novamente.'
      });
    }
  };

  const handleCancel = async () => {
    try {
      toast.loading('Cancelando assinatura...');
      await cancelSubscription();
      toast.success('Assinatura cancelada com sucesso');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura', {
        description: 'Houve um problema ao cancelar sua assinatura. Por favor, tente novamente.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <CustomHeader />
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse text-center">
              <p className="text-gray-400">Carregando planos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <CustomHeader />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Planos e Preços</h1>
          <p className="text-gray-400 mt-2">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>

        {subscription?.cancel_at_period_end && (
          <Card className="mb-8 bg-yellow-500/10 border-yellow-500/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-500">Assinatura Cancelada</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Sua assinatura será cancelada ao final do período atual. 
                    Você ainda tem acesso aos recursos premium até {new Date(subscription.current_period_end).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card className={`bg-gray-800 border-gray-700 ${currentPlan?.name === 'Free' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Para começar a usar</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-gray-400 ml-2">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>100 contatos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>500 mensagens/mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Conexão com WhatsApp</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={currentPlan?.name === 'Free' ? 'secondary' : 'default'}
                disabled={currentPlan?.name === 'Free'}
              >
                {currentPlan?.name === 'Free' ? 'Plano Atual' : 'Selecionar Plano'}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className={`bg-gray-800 border-gray-700 ${currentPlan?.name === 'Pro' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Para profissionais</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 49,90</span>
                <span className="text-gray-400 ml-2">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>1.000 contatos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>5.000 mensagens/mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Importação CSV</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Estatísticas avançadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlan?.name === 'Pro' ? (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={subscription?.cancel_at_period_end}
                >
                  {subscription?.cancel_at_period_end ? 'Cancelamento Agendado' : 'Cancelar Plano'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('pro')}
                  disabled={subscription?.cancel_at_period_end}
                >
                  Assinar Plano Pro
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Business Plan */}
          <Card className={`bg-gray-800 border-gray-700 ${currentPlan?.name === 'Business' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <CardDescription>Para empresas</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 99,90</span>
                <span className="text-gray-400 ml-2">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>5.000 contatos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>50.000 mensagens/mês</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Todas as features do Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>API de integração</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-500" />
                  <span>Múltiplas conexões</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlan?.name === 'Business' ? (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={subscription?.cancel_at_period_end}
                >
                  {subscription?.cancel_at_period_end ? 'Cancelamento Agendado' : 'Cancelar Plano'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('business')}
                  disabled={subscription?.cancel_at_period_end}
                >
                  Assinar Plano Business
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Plans; 