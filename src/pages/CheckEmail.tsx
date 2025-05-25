import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const CheckEmail: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">WhatsReMKT</h1>
          <p className="text-gray-400 mt-2">Verifique seu email</p>
        </div>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-gray-100 text-center">Confirme seu email</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Enviamos um link de confirmação para o seu email.
              Por favor, verifique sua caixa de entrada e spam.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center text-gray-300">
            <p>
              Após confirmar seu email, você poderá fazer login e começar a usar o WhatsReMKT.
            </p>
          </CardContent>
          
          <CardFooter className="flex-col space-y-4">
            <Link to="/login" className="w-full">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Ir para o login
              </Button>
            </Link>
            
            <p className="text-center text-sm text-gray-400">
              Não recebeu o email?{" "}
              <button
                onClick={() => window.location.reload()}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Reenviar
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmail; 