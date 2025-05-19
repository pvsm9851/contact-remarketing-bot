
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth, clearCache } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => clearCache()}
            >
              Limpar Cache
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Conecte seu WhatsApp para enviar mensagens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Conecte seu celular para enviar mensagens para seus contatos de forma automatizada.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/whatsapp")} className="w-full">
                Conectar WhatsApp
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contatos</CardTitle>
              <CardDescription>Gerencie seus contatos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Importe contatos para poder enviar mensagens de remarketing.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/contatos")} className="w-full">
                Gerenciar Contatos
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bemvindo, {auth.user?.name}</CardTitle>
              <CardDescription>Seu ID: {auth.user?.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Email: {auth.user?.email}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Editar Perfil
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
