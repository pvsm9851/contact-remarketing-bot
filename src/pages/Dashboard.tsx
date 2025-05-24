import { useState, useEffect } from "react";
import { CustomHeader } from "@/components/CustomHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStats } from "@/contexts/StatsContext";
import { MessageSquare, Users, Zap, BarChart3, Settings, Bell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { stats, isLoading } = useStats();
  const [totalContacts, setTotalContacts] = useState(0);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Limites do plano (você pode ajustar conforme necessário)
  const limits = {
    messages: 1000,
    contacts: 500
  };

  // Buscar contagem de contatos
  useEffect(() => {
    const fetchContactsCount = async () => {
      if (!auth.user) return;

      try {
        const { count, error } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', auth.user.id);

        if (error) throw error;
        setTotalContacts(count || 0);
      } catch (error) {
        console.error('Error fetching contacts count:', error);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContactsCount();
  }, [auth.user]);

  // Calcular porcentagens
  const getPercentage = (value: number, total: number) => {
    return Math.round((value / total) * 100);
  };

  // Calcular taxa de entrega
  const getDeliveryRate = () => {
    if (!stats) return 0;
    const total = stats.total_messages_sent + stats.total_messages_failed;
    if (total === 0) return 100;
    return Math.round((stats.total_messages_sent / total) * 100);
  };

  if (isLoading || loadingContacts) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <CustomHeader />
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse text-center">
              <p className="text-gray-400">Carregando estatísticas...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100">
      <CustomHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Cabeçalho com Boas-vindas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Olá, {auth.user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400">
            Bem-vindo ao seu painel de controle
          </p>
        </div>

        {/* Status do WhatsApp */}
        <div className="grid gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Status do Plano</h3>
                  <p className="text-sm text-gray-400">Plano Profissional</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-700"
                  onClick={() => navigate("/planos")}
                >
                  Gerenciar Plano
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Mensagens Enviadas</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{stats?.total_messages_sent || 0} / {limits.messages}</span>
                      <span className="text-gray-400">{getPercentage(stats?.total_messages_sent || 0, limits.messages)}%</span>
                    </div>
                    <Progress value={getPercentage(stats?.total_messages_sent || 0, limits.messages)} className="bg-gray-700" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Contatos</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{totalContacts} / {limits.contacts}</span>
                      <span className="text-gray-400">{getPercentage(totalContacts, limits.contacts)}%</span>
                    </div>
                    <Progress value={getPercentage(totalContacts, limits.contacts)} className="bg-gray-700" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Taxa de Entrega</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{getDeliveryRate()}%</span>
                      <span className={getDeliveryRate() > 95 ? "text-green-500" : "text-yellow-500"}>
                        {getDeliveryRate() > 95 ? "Excelente" : "Boa"}
                      </span>
                    </div>
                    <Progress value={getDeliveryRate()} className="bg-gray-700" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Ações Principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate("/whatsapp")}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-sm text-gray-400">
                    Configure sua conexão com WhatsApp
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate("/contatos")}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Contatos</h3>
                  <p className="text-sm text-gray-400">
                    Gerencie sua lista de contatos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate("/mensagens")}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Mensagens</h3>
                  <p className="text-sm text-gray-400">
                    Histórico e status de mensagens
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atividade Recente e Notificações */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Atividade Recente</h3>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-gray-300">
                    {stats?.total_messages_sent || 0} mensagens enviadas no total
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-gray-300">
                    {totalContacts} contatos cadastrados
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <p className="text-gray-300">
                    {stats?.total_messages_failed || 0} mensagens não entregues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notificações</h3>
                <Bell className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-gray-300">WhatsApp conectado e funcionando normalmente</p>
                </div>
                {(stats?.total_messages_sent || 0) > (limits.messages * 0.8) && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <p className="text-gray-300">80% do limite de mensagens atingido</p>
                  </div>
                )}
                {totalContacts > (limits.contacts * 0.8) && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <p className="text-gray-300">80% do limite de contatos atingido</p>
                  </div>
                )}
                {(stats?.total_messages_failed || 0) > 0 && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <p className="text-gray-300">{stats?.total_messages_failed} mensagens não foram entregues</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
