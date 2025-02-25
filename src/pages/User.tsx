
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LogOut, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";

const User = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  if (!session?.user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Profilo Utente
        </h1>
        
        <Card className="p-6 bg-[#24253a] border-[#383a5c]">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-lg">{session.user.email}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default User;
