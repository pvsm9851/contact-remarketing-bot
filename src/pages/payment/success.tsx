import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { currentPlan } = useSubscription();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-center">
            Sua assinatura foi ativada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium">
              Plano {currentPlan?.name || 'Premium'}
            </p>
            <p className="text-sm text-muted-foreground">
              Agora você tem acesso a todos os recursos do plano.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button onClick={() => navigate('/dashboard')}>
            Ir para o Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Configurações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 