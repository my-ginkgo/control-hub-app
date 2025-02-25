
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Project } from "@/types/Project";
import { useAuth } from "@/components/AuthProvider";
import { User } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserSelect } from "./time-entry/UserSelect";
import { ProjectSelect } from "./time-entry/ProjectSelect";

interface TimeEntryProps {
  onSubmit: (data: TimeEntryData) => void;
  projects: Project[];
}

export function TimeEntry({ onSubmit, projects }: TimeEntryProps) {
  const { session } = useAuth();
  const { role } = useRole();
  const [hours, setHours] = useState("");
  const [billableHours, setBillableHours] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("user_roles")
        .select("user_id, auth.users!inner(email)");

      if (error) throw error;
      return profiles.map((profile: any) => ({
        id: profile.user_id,
        email: profile.users.email,
      }));
    },
    enabled: role === "ADMIN",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !project) {
      toast.error("Per favore compila tutti i campi obbligatori");
      return;
    }

    onSubmit({
      hours: parseFloat(hours),
      billableHours: billableHours ? parseFloat(billableHours) : parseFloat(hours),
      project,
      notes,
      date: new Date().toISOString(),
      assignedUserId: selectedUserId || session?.user?.id || "",
    });

    setHours("");
    setBillableHours("");
    setProject("");
    setNotes("");
    setSelectedUserId("");
    toast.success("Tempo registrato con successo!");
  };

  return (
    <Card className="p-4 md:p-6 bg-[#24253a] border-[#383a5c] shadow-lg animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-4">
        {role === "ADMIN" ? (
          <UserSelect
            users={users}
            selectedUserId={selectedUserId}
            userOpen={userOpen}
            setUserOpen={setUserOpen}
            setSelectedUserId={setSelectedUserId}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
          />
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-md bg-[#1a1b26] border border-[#383a5c] text-white">
            <User className="h-4 w-4 text-gray-400" />
            <span>{session?.user?.email}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium text-gray-200">
              Ore Reali *
            </label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Es. 8"
              className="w-full bg-[#1a1b26] border-[#383a5c] text-white placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="billableHours" className="text-sm font-medium text-gray-200">
              Ore Fatturabili
            </label>
            <Input
              id="billableHours"
              type="number"
              step="0.5"
              min="0"
              value={billableHours}
              onChange={(e) => setBillableHours(e.target.value)}
              placeholder="Es. 7.5"
              className="w-full bg-[#1a1b26] border-[#383a5c] text-white placeholder:text-gray-400"
            />
          </div>
        </div>
        <ProjectSelect
          projects={projects}
          project={project}
          open={open}
          setOpen={setOpen}
          setProject={setProject}
        />
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-gray-200">
            Note
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descrizione delle attività svolte..."
            className="w-full min-h-[100px] bg-[#1a1b26] border-[#383a5c] text-white placeholder:text-gray-400"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          Registra Tempo
        </Button>
      </form>
    </Card>
  );
}

export interface TimeEntryData {
  hours: number;
  billableHours: number;
  project: string;
  notes: string;
  date: string;
  assignedUserId: string;
}
