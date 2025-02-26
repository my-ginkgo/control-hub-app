
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { toast } from "sonner";

export const deleteProject = async (projectId: string) => {
  try {
    const { error: timeEntriesError } = await supabase
      .from("time_entries")
      .delete()
      .eq("project_id", projectId);

    if (timeEntriesError) throw timeEntriesError;

    const { error: projectError } = await supabase.from("projects").delete().eq("id", projectId);

    if (projectError) throw projectError;

    toast.success("Progetto eliminato con successo");
    return true;
  } catch (error: any) {
    toast.error("Errore durante l'eliminazione del progetto: " + error.message);
    return false;
  }
};

export const updateProject = async (projectId: string, data: {
  name: string;
  description: string;
  clientId: string;
  color: string;
  isPublic: boolean;
}) => {
  try {
    const { error } = await supabase
      .from("projects")
      .update({
        name: data.name,
        description: data.description,
        client_id: data.clientId === "no_client" ? null : data.clientId,
        color: data.color,
        is_public: data.isPublic,
      })
      .eq("id", projectId);

    if (error) throw error;

    toast.success("Progetto aggiornato con successo");
    return true;
  } catch (error: any) {
    toast.error("Errore durante l'aggiornamento del progetto: " + error.message);
    return false;
  }
};

