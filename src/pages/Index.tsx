
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
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
