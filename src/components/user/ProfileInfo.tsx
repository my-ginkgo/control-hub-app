
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, BadgeCheck, User as UserIcon, Briefcase, Calendar } from "lucide-react";

interface ProfileInfoProps {
  session: any;
  profile: any;
  isLoading: boolean;
  isEditing: boolean;
  role: string | undefined;
  firstName: string;
  lastName: string;
  bio: string;
  jobTitle: string;
  dateOfBirth: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setBio: (value: string) => void;
  setJobTitle: (value: string) => void;
  setDateOfBirth: (value: string) => void;
}

export const ProfileInfo = ({
  session,
  profile,
  isLoading,
  isEditing,
  role,
  firstName,
  lastName,
  bio,
  jobTitle,
  dateOfBirth,
  setFirstName,
  setLastName,
  setBio,
  setJobTitle,
  setDateOfBirth,
}: ProfileInfoProps) => {
  return (
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
        <Briefcase className="w-6 h-6 text-purple-400" />
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">Ruolo Lavorativo</p>
          {isEditing ? (
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Es. Sviluppatore Software"
              className="bg-[#1a1b26] border-[#383a5c] text-white placeholder-gray-400"
            />
          ) : (
            <p className="text-lg">{profile?.job_title || "Non specificato"}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Calendar className="w-6 h-6 text-purple-400" />
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">Data di Nascita</p>
          {isEditing ? (
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-[#1a1b26] border-[#383a5c] text-white"
            />
          ) : (
            <p className="text-lg">
              {profile?.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString()
                : "Non specificata"}
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
              {isLoading ? "Caricamento..." : role === "DIPENDENTE" ? "Dipendente" : role}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <UserIcon className="w-6 h-6 text-purple-400 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Bio</p>
            {isEditing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Raccontaci qualcosa di te..."
                className="bg-[#1a1b26] border-[#383a5c] text-white placeholder-gray-400 min-h-[100px]"
              />
            ) : (
              <p className="text-lg whitespace-pre-wrap">
                {profile?.bio || "Nessuna bio specificata"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
