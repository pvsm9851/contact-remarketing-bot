
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Users, BarChart3, MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-brand-800">WhatsReMKT</div>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/registro">Registrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Potencialize seu marketing com o WhatsApp
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Conecte seu WhatsApp e envie mensagens de remarketing para seus contatos de forma simples e eficaz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-brand-800 hover:bg-gray-100">
                <Link to="/registro">Começar Agora</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="bg-transparent border border-white text-white hover:bg-white/10">
                <Link to="/login">Já tenho uma conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg">
              <div className="w-16 h-16 bg-brand-100 text-brand-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Registre-se</h3>
              <p className="text-gray-600">Crie sua conta em minutos e configure seu perfil.</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="w-16 h-16 bg-brand-100 text-brand-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Conecte o WhatsApp</h3>
              <p className="text-gray-600">Escaneie o código QR e conecte seu WhatsApp à plataforma.</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="w-16 h-16 bg-brand-100 text-brand-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envie Mensagens</h3>
              <p className="text-gray-600">Alcance seus contatos com mensagens personalizadas.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefícios</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Rápido e eficiente</h3>
              <p className="text-gray-600">Alcance seus clientes de forma imediata com mensagens diretas.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Users className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Amplo alcance</h3>
              <p className="text-gray-600">Atinja milhares de contatos com apenas alguns cliques.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <BarChart3 className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Análise de desempenho</h3>
              <p className="text-gray-600">Acompanhe o status de entrega e leitura das suas mensagens.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MessageCircle className="h-10 w-10 text-brand-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalização</h3>
              <p className="text-gray-600">Crie mensagens personalizadas para diferentes grupos de contatos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Account Creation */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Criação de Conta</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img src="https://via.placeholder.com/500x300" alt="Criação de conta" className="rounded-lg shadow-md" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">Simples e rápido</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Registro gratuito em menos de 1 minuto</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Não precisa de cartão de crédito para começar</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Interface intuitiva e fácil de usar</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte técnico disponível</span>
                  </li>
                </ul>
                <Button asChild className="mt-6">
                  <Link to="/registro">Criar minha conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Planos</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio. Pague apenas pelo que usar.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold">Básico</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">R$0,05</span>
                  <span className="ml-1 text-gray-500">/ mensagem</span>
                </div>
                <p className="mt-4 text-gray-600">Para pequenas empresas que estão começando com marketing por WhatsApp</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 1.000 mensagens/mês</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Importação de contatos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Mensagens de texto</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link to="/registro">Começar Grátis</Link>
                </Button>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-md border-2 border-brand-500 relative overflow-hidden transform scale-105">
              <div className="bg-brand-500 text-white py-1 px-4 absolute top-0 right-0 rounded-bl-lg text-sm font-semibold">
                POPULAR
              </div>
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold">Profissional</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">R$0,03</span>
                  <span className="ml-1 text-gray-500">/ mensagem</span>
                </div>
                <p className="mt-4 text-gray-600">Para empresas que precisam de mais recursos e volume de mensagens</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Até 10.000 mensagens/mês</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Importação de contatos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Mensagens de texto e mídia</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Relatórios avançados</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link to="/registro">Escolher Plano</Link>
                </Button>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-bold">Empresarial</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">R$0,02</span>
                  <span className="ml-1 text-gray-500">/ mensagem</span>
                </div>
                <p className="mt-4 text-gray-600">Para grandes empresas com alto volume de mensagens e necessidades personalizadas</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Mensagens ilimitadas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Todas as funcionalidades</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>API dedicada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Gerente de conta dedicado</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Treinamento personalizado</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link to="/registro">Contato Comercial</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 text-gray-600">
            <p>Todos os preços estão em Reais (R$). Cobranças realizadas mensalmente com base no uso.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Registre-se hoje e comece a enviar mensagens de remarketing para seus contatos via WhatsApp.
          </p>
          <Button size="lg" asChild>
            <Link to="/registro">Criar minha conta</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl">WhatsReMKT</div>
              <p className="text-gray-400 mt-1">A plataforma ideal para seu remarketing via WhatsApp</p>
            </div>
            <div className="flex gap-8">
              <Link to="/" className="hover:text-brand-300">Home</Link>
              <Link to="/login" className="hover:text-brand-300">Login</Link>
              <Link to="/registro" className="hover:text-brand-300">Registrar</Link>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} WhatsReMKT. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
