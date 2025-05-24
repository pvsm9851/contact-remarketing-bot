import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomHeader } from "@/components/CustomHeader";
import { Check, MessageCircle, Users, Zap, BarChart3, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { PricingPlans } from '@/components/PricingPlans';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <CustomHeader />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Marketing em Massa via WhatsApp
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Automatize suas mensagens, gerencie contatos e aumente suas vendas com nossa plataforma profissional de marketing via WhatsApp.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Criar Conta Grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-gray-400">
              Escolha o plano ideal para o seu negócio
            </p>
          </div>

          <PricingPlans />
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Principais</h2>
            <p className="text-gray-400">
              Tudo que você precisa para alavancar seu marketing no WhatsApp
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Conexão Simples</h3>
              <p className="text-gray-400">
                Conecte-se ao WhatsApp em segundos com um simples QR Code
              </p>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Importação em Massa</h3>
              <p className="text-gray-400">
                Importe seus contatos facilmente via arquivo CSV
              </p>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Estatísticas Detalhadas</h3>
              <p className="text-gray-400">
                Acompanhe o desempenho de suas campanhas em tempo real
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Contact Remarketing Bot. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 