
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center space-y-4">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Benvenuto in Time Tracker
          </h2>
          <p className="text-muted-foreground text-center">
            Accedi per iniziare a tracciare il tuo tempo
          </p>
        </div>
        
        <Button
          onClick={() => navigate("/login")}
          className="w-full"
        >
          Accedi
        </Button>
      </div>
    </div>
  );
};

export default Auth;
