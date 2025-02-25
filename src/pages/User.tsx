
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { LogOut, Mail, BadgeCheck, User as UserIcon, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const User = () => {
  const { session, signOut } = useAuth();
  const { role, isLoading: isLoadingRole } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    onSuccess: (data) => {
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
    },
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", session?.user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state aggiornate con successo.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del profilo.",
        variant: "destructive",
      });
    },
  });

  if (!session?.user) {
    navigate("/auth");
    return null;
  }

  const isLoading = isLoadingRole || isLoadingProfile;

  return (
    <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Profilo Utente
        </h1>
        
        <Card className="p-6 bg-[#24253a] border-[#383a5c] space-y-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <UserIcon className="w-6 h-6 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Nome e Cognome</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nome"
                      className="bg-[#1a1b26] border-[#383a5c] text-white placeholder-gray-400"
                    />
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Cognome"
                      className="bg-[#1a1b26] border-[#383a5c] text-white placeholder-gray-400"
                    />
                  </div>
                ) : (
                  <p className="text-lg">
                    {profile?.first_name || profile?.last_name
                      ? `${profile.first_name || ""} ${profile.last_name || ""}`
                      : "Non specificato"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-lg">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <BadgeCheck className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Ruolo</p>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    role === "ADMIN" 
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                      : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  }`}>
                    {isLoading ? "Caricamento..." : role}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => updateProfile.mutate()}
                    className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
                    disabled={updateProfile.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFirstName(profile?.first_name || "");
                      setLastName(profile?.last_name || "");
                    }}
                    className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
                  >
                    Annulla
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
                >
                  Modifica Profilo
                </Button>
              )}
              
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
