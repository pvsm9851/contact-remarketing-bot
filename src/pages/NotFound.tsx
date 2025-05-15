
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-brand-800 mb-4">404</h1>
        <p className="text-2xl mb-6">Página não encontrada</p>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Button asChild>
          <Link to="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
