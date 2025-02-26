
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { role, isLoading: isLoadingRole } = useRole();
  const queryClient = useQueryClient();

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

      const { data: userRoles, error: rolesError } = await supabase.from("user_roles").select("user_id, role, email, is_disabled");

      if (rolesError) throw rolesError;

      return profiles.map((profile) => ({
        ...profile,
        ...userRoles.find((ur) => ur.user_id === profile.id),
      }));
    },
    enabled: role === "ADMIN",
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "ADMIN" | "DIPENDENTE" }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ruolo aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    },
    onError: (error) => {
      toast.error("Errore durante l'aggiornamento del ruolo: " + error.message);
    },
  });

  const toggleUserDisabled = useMutation({
    mutationFn: async ({ userId, isDisabled }: { userId: string; isDisabled: boolean }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ is_disabled: isDisabled })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isDisabled ? "Utente disabilitato con successo" : "Utente abilitato con successo"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
    },
    onError: (error) => {
      toast.error("Errore durante l'aggiornamento dello stato utente: " + error.message);
    },
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
                <TableHead className="text-gray-400">Stato</TableHead>
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
                    <Select
                      value={profile.role}
                      onValueChange={(newRole: "ADMIN" | "DIPENDENTE") => {
                        updateUserRole.mutate({ userId: profile.id, newRole });
                      }}>
                      <SelectTrigger className="w-[180px] bg-transparent text-white border-[#383a5c]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="DIPENDENTE">DIPENDENTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        profile.is_disabled
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}>
                      {profile.is_disabled ? "Disabilitato" : "Attivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/user/${profile.id}`)}
                        className="text-muted-foreground hover:text-foreground">
                        Visualizza
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleUserDisabled.mutate({ userId: profile.id, isDisabled: !profile.is_disabled })
                        }
                        className={`${
                          profile.is_disabled
                            ? "text-green-400 hover:text-green-300"
                            : "text-red-400 hover:text-red-300"
                        }`}>
                        {profile.is_disabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                    </div>
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

