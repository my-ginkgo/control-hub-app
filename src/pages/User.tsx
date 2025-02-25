
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const User = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { role, isLoading: isLoadingRole } = useRole();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Use the ID from params, fallback to current user's ID if not provided
  const userId = id || session?.user?.id;

  // Redirect to auth if not logged in
  if (!session?.user) {
    navigate("/auth");
    return null;
  }

  // Redirect to home if not admin and trying to access another user's profile
  if (!isLoadingRole && role !== "ADMIN" && userId !== session.user.id) {
    navigate("/");
    return null;
  }

  const { data: profiles, isLoading: isLoadingProfiles, refetch } = useQuery({
    queryKey: ["admin-profiles", userId],
    queryFn: async () => {
      try {
        // If viewing a specific user's profile
        if (id) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (profileError) throw profileError;

          const { data: userRole, error: roleError } = await supabase
            .from("user_roles")
            .select("user_id, role, email, is_disabled")
            .eq("user_id", userId)
            .single();

          if (roleError) throw roleError;

          // Set form values
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setJobTitle(profile.job_title || "");
          setBio(profile.bio || "");

          return [{
            ...profile,
            ...userRole
          }];
        }

        // Admin view - fetch all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) throw profilesError;

        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id, role, email, is_disabled");

        if (rolesError) throw rolesError;

        return profiles.map(profile => ({
          ...profile,
          ...userRoles.find(ur => ur.user_id === profile.id)
        }));
      } catch (error: any) {
        toast.error("Errore nel caricamento degli utenti: " + error.message);
        return [];
      }
    },
    enabled: role === "ADMIN" || userId === session.user.id,
  });

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_disabled: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Utente ${currentStatus ? 'abilitato' : 'disabilitato'} con successo`);
      refetch();
    } catch (error: any) {
      toast.error("Errore durante l'aggiornamento dello stato: " + error.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle,
          bio: bio,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast.success('Profilo aggiornato con successo');
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast.error("Errore durante l'aggiornamento del profilo: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingRole || isLoadingProfiles) {
    return (
      <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
        <div className="container max-w-4xl mx-auto">
          <p className="text-center">Caricamento...</p>
        </div>
      </div>
    );
  }

  // If viewing own profile
  if (userId === session.user.id) {
    return (
      <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
        <div className="container max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Il Mio Profilo
          </h1>

          <Card className="p-6 bg-[#24253a] border-[#383a5c] space-y-4">
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Nome</label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Cognome</label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ruolo Lavorativo</label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Bio</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-400">Nome e Cognome</p>
                    <p className="mt-1">
                      {firstName || lastName
                        ? `${firstName || ""} ${lastName || ""}`
                        : "Non specificato"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Ruolo Lavorativo</p>
                    <p className="mt-1">{jobTitle || "Non specificato"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Bio</p>
                    <p className="mt-1">{bio || "Non specificata"}</p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 space-y-3">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveProfile}
                    className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
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
                onClick={() => session.signOut()}
                className="w-full border-[#383a5c] text-white hover:bg-[#2a2b3d]"
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Admin view of all users or specific user
  return (
    <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
      <div className="container max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {id ? "Profilo Utente" : "Gestione Utenti"}
        </h1>

        <Card className="p-6 bg-[#24253a] border-[#383a5c]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Nome</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Ruolo</TableHead>
                <TableHead className="text-gray-400">Stato</TableHead>
                {!id && role === "ADMIN" && (
                  <TableHead className="text-gray-400">Azioni</TableHead>
                )}
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
                      }`}
                    >
                      {profile.role || "DIPENDENTE"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {role === "ADMIN" ? (
                        <>
                          <Switch
                            checked={!profile.is_disabled}
                            onCheckedChange={() => handleToggleUserStatus(profile.id, profile.is_disabled)}
                            className={profile.is_disabled ? "bg-red-500/20" : ""}
                          />
                          <span className="text-sm text-muted-foreground">
                            {profile.is_disabled ? "Disabilitato" : "Attivo"}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {profile.is_disabled ? "Disabilitato" : "Attivo"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {!id && role === "ADMIN" && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/user/${profile.id}`)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Visualizza
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default User;
