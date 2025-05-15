
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { auth } = useAuth();
  const { session } = useWhatsApp();
  
  // Mock data for dashboard
  const stats = [
    { label: "Total de Contatos", value: "0" },
    { label: "Mensagens enviadas", value: "0" },
    { label: "Taxa de abertura", value: "0%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link to="/contatos">
                Ver contatos
              </Link>
            </Button>
            <Button asChild>
              <Link to="/mensagens/nova">
                Nova mensagem
              </Link>
            </Button>
          </div>
        </div>
        
        {!session?.connected && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-800">Conecte seu WhatsApp</CardTitle>
              <CardDescription className="text-yellow-700">
                Para usar o sistema de remarketing, você precisa conectar sua conta do WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                <Link to="/whatsapp">
                  Conectar WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Atividade recente</CardTitle>
              <CardDescription>Suas últimas interações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <p>Nenhuma atividade recente.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Próximas mensagens</CardTitle>
              <CardDescription>Mensagens agendadas para envio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <p>Nenhuma mensagem agendada.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
