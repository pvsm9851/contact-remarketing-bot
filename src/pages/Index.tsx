
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Send, Users, Shield, BarChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero section */}
      <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-500">Zenviax</h1>
            <span className="ml-2 text-sm text-gray-400">Mensagens WhatsApp</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Login
            </Button>
            
            <Button
              onClick={() => navigate("/registro")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Envie mensagens em massa pelo <span className="text-blue-500">WhatsApp</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Plataforma completa para envio de mensagens em massa para seus contatos
            com facilidade e eficiência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/registro")} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
            >
              Comece Agora
            </Button>
            <Button 
              onClick={() => navigate("/whatsapp")} 
              variant="outline" 
              size="lg" 
              className="border-gray-700 text-gray-200 hover:bg-gray-800 text-lg px-8"
            >
              Testar Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-500 text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Conecte seu WhatsApp</h3>
              <p className="text-gray-400">
                Escaneie o QR code com seu celular e conecte sua conta do WhatsApp à plataforma.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-500 text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Importe seus contatos</h3>
              <p className="text-gray-400">
                Faça upload de um arquivo CSV com seus contatos ou adicione-os manualmente.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-500 text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Envie mensagens</h3>
              <p className="text-gray-400">
                Escreva sua mensagem e envie para todos os seus contatos com apenas um clique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefícios</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Check className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Rápido e Eficiente</h3>
                <p className="text-gray-400">
                  Envie centenas de mensagens em minutos, sem precisar digitar uma a uma.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Check className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sem Bloqueios</h3>
                <p className="text-gray-400">
                  Nossa tecnologia evita bloqueios por envio em massa, mantendo sua conta segura.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Check className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Gerenciamento de Contatos</h3>
                <p className="text-gray-400">
                  Organize seus contatos em grupos e segmente suas campanhas para melhor eficiência.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <Check className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
                <p className="text-gray-400">
                  Acompanhe o desempenho das suas campanhas com relatórios detalhados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Planos</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Pague apenas pelo que usar.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold mb-2">Básico</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">R$ 0,05</span>
                  <span className="text-gray-400 ml-1">/mensagem</span>
                </div>
                <p className="text-gray-400">Ideal para pequenos negócios</p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Até 1.000 mensagens/mês</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Importação de contatos</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-8 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => navigate("/registro")}
                >
                  Começar Agora
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-blue-600 overflow-hidden transform scale-105 shadow-xl">
              <div className="bg-blue-600 py-2 text-center">
                <span className="text-sm font-semibold">MAIS POPULAR</span>
              </div>
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold mb-2">Profissional</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">R$ 0,03</span>
                  <span className="text-gray-400 ml-1">/mensagem</span>
                </div>
                <p className="text-gray-400">Perfeito para empresas em crescimento</p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Até 10.000 mensagens/mês</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Importação e gestão de contatos</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-8 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => navigate("/registro")}
                >
                  Começar Agora
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold mb-2">Empresarial</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">R$ 0,02</span>
                  <span className="text-gray-400 ml-1">/mensagem</span>
                </div>
                <p className="text-gray-400">Para grandes empresas e agências</p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Mensagens ilimitadas</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Gestão avançada de contatos</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>API para integração</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <span>Suporte 24/7</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-8 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => navigate("/registro")}
                >
                  Falar com Vendas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Comece a enviar mensagens em massa pelo WhatsApp hoje mesmo.
          </p>
          <Button 
            onClick={() => navigate("/registro")} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
          >
            Criar Conta Grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold text-blue-500 mb-4">Zenviax</h2>
              <p className="text-gray-400 max-w-xs">
                Plataforma para envio de mensagens em massa pelo WhatsApp com facilidade e eficiência.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Plataforma</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Como funciona</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Planos</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Sobre nós</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Contato</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Termos de Serviço</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-gray-300">Política de Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Zenviax. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
