import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client-browser';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/services/notification';

interface PaymentStatus {
  status: 'pending' | 'success' | 'failed' | null;
  message: string | null;
}

export function usePaymentStatus() {
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  const [status, setStatus] = useState<PaymentStatus>({
    status: null,
    message: null
  });

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    if (!payment || !auth.user) return;

    let pollingInterval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 10;

    const checkPaymentStatus = async () => {
      try {
        // Buscar o último pagamento do usuário
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id, status, payment_provider_subscription_id')
          .eq('user_id', auth.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscriptionError) throw subscriptionError;

        if (!subscriptionData) {
          attempts++;
          if (attempts >= maxAttempts) {
            setStatus({
              status: 'failed',
              message: 'Não foi possível confirmar o status do pagamento.'
            });
            notify.error('Erro no pagamento', {
              description: 'Não foi possível confirmar o status do pagamento. Por favor, entre em contato com o suporte.'
            });
            clearInterval(pollingInterval);
            return;
          }
          return;
        }

        // Buscar o último pagamento da assinatura
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_history')
          .select('status, provider_payment_id')
          .eq('subscription_id', subscriptionData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (paymentError) throw paymentError;

        // Se temos um session_id, verificar se o pagamento corresponde
        if (sessionId && paymentData.provider_payment_id !== sessionId) {
          attempts++;
          if (attempts >= maxAttempts) {
            setStatus({
              status: 'failed',
              message: 'Não foi possível confirmar o status do pagamento.'
            });
            notify.error('Erro no pagamento', {
              description: 'Não foi possível confirmar o status do pagamento. Por favor, entre em contato com o suporte.'
            });
            clearInterval(pollingInterval);
          }
          return;
        }

        if (paymentData.status === 'succeeded') {
          setStatus({
            status: 'success',
            message: 'Pagamento processado com sucesso!'
          });
          notify.success('Pagamento confirmado', {
            description: 'Sua assinatura foi ativada com sucesso!'
          });
          clearInterval(pollingInterval);
        } else if (paymentData.status === 'failed') {
          setStatus({
            status: 'failed',
            message: 'Falha no processamento do pagamento.'
          });
          notify.error('Erro no pagamento', {
            description: 'Houve um problema ao processar seu pagamento. Por favor, tente novamente.'
          });
          clearInterval(pollingInterval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus({
            status: 'failed',
            message: 'Erro ao verificar status do pagamento.'
          });
          notify.error('Erro no pagamento', {
            description: 'Houve um problema ao verificar o status do pagamento. Por favor, entre em contato com o suporte.'
          });
          clearInterval(pollingInterval);
        }
      }
    };

    // Iniciar polling apenas se o parâmetro payment for 'success'
    if (payment === 'success') {
      setStatus({
        status: 'pending',
        message: 'Processando seu pagamento...'
      });
      pollingInterval = setInterval(checkPaymentStatus, 2000); // Verificar a cada 2 segundos
      checkPaymentStatus(); // Primeira verificação imediata
    } else if (payment === 'cancelled') {
      setStatus({
        status: 'failed',
        message: 'Pagamento cancelado.'
      });
      notify.error('Pagamento cancelado', {
        description: 'O processo de pagamento foi cancelado.'
      });
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [searchParams, auth.user]);

  return status;
} 