
import { CustomHeader } from "@/components/CustomHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth, clearCache } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <CustomHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => clearCache()}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Limpar Cache
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700 text-gray-100">
            <CardHeader>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription className="text-gray-400">Conecte seu WhatsApp para enviar mensagens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Conecte seu celular para enviar mensagens para seus contatos de forma automatizada.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/whatsapp")} className="w-full">
                Conectar WhatsApp
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 text-gray-100">
            <CardHeader>
              <CardTitle>Contatos</CardTitle>
              <CardDescription className="text-gray-400">Gerencie seus contatos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Importe contatos para poder enviar mensagens de remarketing.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/contatos")} className="w-full">
                Gerenciar Contatos
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 text-gray-100">
            <CardHeader>
              <CardTitle>Conversas</CardTitle>
              <CardDescription className="text-gray-400">Visualize suas conversas de WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <MessageSquare className="h-20 w-20 text-primary opacity-20" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/chats")} className="w-full">
                Ver Conversas
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 text-gray-100">
            <CardHeader>
              <CardTitle>Bemvindo, {auth.user?.name}</CardTitle>
              <CardDescription className="text-gray-400">Seu ID: {auth.user?.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Email: {auth.user?.email}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-700">
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
