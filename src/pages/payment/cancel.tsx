import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-center text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription className="text-center">
            O processo de pagamento foi cancelado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Se você encontrou algum problema durante o processo de pagamento,
              entre em contato com nosso suporte.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button onClick={() => navigate('/plans')}>
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={() => navigate('/support')}>
            Contatar Suporte
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 