
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectContainerProps {
  session: { user: { id: string } } | null;
  onProjectsUpdate: (projects: Project[]) => void;
}

export function ProjectContainer({ session, onProjectsUpdate }: ProjectContainerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
    }
  }, [session?.user?.id]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      onProjectsUpdate(data || []);
    } catch (error: any) {
      toast.error("Error fetching projects: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (project: Omit<Project, "id">) => {
    try {
      const { error } = await supabase.from("projects").insert({
        name: project.name,
        description: project.description,
        color: project.color,
        is_public: project.is_public,
        user_id: session?.user?.id,
      });

      if (error) throw error;

      fetchProjects();
      toast.success("Progetto aggiunto con successo!");
    } catch (error: any) {
      toast.error("Error adding project: " + error.message);
    }
  };

  return null; // This component manages state but doesn't render anything
}
