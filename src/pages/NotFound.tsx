
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1b26] p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-red-700 to-amber-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white">Oops! Pagina non trovata</h2>
          <p className="text-gray-400">
            Ci dispiace, ma la pagina che stai cercando sembra essere andata in vacanza 🏖️
          </p>
        </div>
        
        <div className="relative">
          <div className="w-32 h-32 mx-auto">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain opacity-50"
            />
          </div>
        </div>

        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-gradient-to-r from-red-700 to-amber-400 hover:from-red-800 hover:to-amber-500 text-white"
        >
          <Home className="mr-2 h-4 w-4" />
          Torna alla Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
