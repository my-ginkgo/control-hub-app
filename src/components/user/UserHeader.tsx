import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserHeaderProps {
  role: string | undefined;
  isLoadingRole: boolean;
}

export const UserHeader = ({ role }: UserHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="-ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>

        {role === "ADMIN" && (
          <Button
            variant="outline"
            onClick={() => navigate("/admin/users")}
            className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
            Gestione Utenti
          </Button>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-red-700 to-amber-400 bg-clip-text text-transparent">
        Profilo Utente
      </h1>
    </>
  );
};
