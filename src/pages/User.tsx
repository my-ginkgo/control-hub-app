import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { ProfileActions } from "@/components/user/ProfileActions";
import { ProfileInfo } from "@/components/user/ProfileInfo";
import { UserHeader } from "@/components/user/UserHeader";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const User = () => {
  const { session, signOut } = useAuth();
  const { role, isLoading: isLoadingRole } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session?.user?.id).single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setBio(profile.bio || "");
      setJobTitle(profile.job_title || "");
      setDateOfBirth(profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split("T")[0] : "");
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          bio,
          job_title: jobTitle,
          date_of_birth: dateOfBirth || null,
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

  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(profile?.first_name || "");
    setLastName(profile?.last_name || "");
    setBio(profile?.bio || "");
    setJobTitle(profile?.job_title || "");
    setDateOfBirth(profile?.date_of_birth ? new Date(profile.date_of_birth).toISOString().split("T")[0] : "");
  };

  return (
    <div className="min-h-screen bg-[#1a1b26] text-white p-4 md:p-8">
      <div className="container max-w-2xl mx-auto">
        <UserHeader role={role} isLoadingRole={isLoadingRole} />

        <Card className="p-6 bg-[#24253a] border-[#383a5c] space-y-6">
          <ProfileInfo
            session={session}
            profile={profile}
            isLoading={isLoading}
            isEditing={isEditing}
            role={role}
            firstName={firstName}
            lastName={lastName}
            bio={bio}
            jobTitle={jobTitle}
            dateOfBirth={dateOfBirth}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setBio={setBio}
            setJobTitle={setJobTitle}
            setDateOfBirth={setDateOfBirth}
          />

          <ProfileActions
            isEditing={isEditing}
            onSave={() => updateProfile.mutate()}
            onCancel={handleCancel}
            onEdit={() => setIsEditing(true)}
            onSignOut={signOut}
            isSaving={updateProfile.isPending}
          />
        </Card>
      </div>
    </div>
  );
};

export default User;
