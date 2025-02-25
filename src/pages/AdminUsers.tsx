import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { role, isLoading: isLoadingRole } = useRole();

  // Redirect to auth if not logged in
  if (!session?.user) {
    navigate("/auth");
    return null;
  }

  // Redirect to home if not admin
  if (!isLoadingRole && role !== "ADMIN") {
    navigate("/");
    return null;
  }

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase.from("user_roles").select("user_id, role, email");

      if (rolesError) throw rolesError;

      return profiles.map((profile) => ({
        ...profile,
        ...userRoles.find((ur) => ur.user_id === profile.id),
      }));
    },
    enabled: role === "ADMIN",
  });

  if (isLoadingRole || isLoadingProfiles) {
    return (
      <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
        <div className="container max-w-4xl mx-auto">
          <p className="text-center">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
      <div className="container max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-red-700 to-amber-400 bg-clip-text text-transparent">
          Gestione Utenti
        </h1>

        <Card className="p-6 bg-[#24253a] border-[#383a5c]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Ruolo</TableHead>
                <TableHead className="text-gray-400">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="text-white">
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name || ""} ${profile.last_name || ""}`
                      : "Non specificato"}
                  </TableCell>
                  <TableCell className="text-white">{profile.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        profile.role === "ADMIN"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}>
                      {profile.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/user/${profile.id}`)}
                      className="text-muted-foreground hover:text-foreground">
                      Visualizza
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
