
import { useState, useEffect } from "react";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientList } from "./sidebar/ClientList";
import { ProjectList } from "./sidebar/ProjectList";

interface ProjectSidebarProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onSelectProject?: (project: Project) => void;
  selectedProject?: Project;
}

export function ProjectSidebar({ 
  projects, 
  onAddProject, 
  onSelectProject,
  selectedProject 
}: ProjectSidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchClients();
    }
  }, [session?.user?.id]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Error fetching clients: " + error.message);
    }
  };

  const toggleProjectExpand = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedProjects((prev) =>
      prev.includes(project.id)
        ? prev.filter((id) => id !== project.id)
        : [...prev, project.id]
    );
  };

  const toggleClientExpand = (client: Client, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedClients((prev) =>
      prev.includes(client.id)
        ? prev.filter((id) => id !== client.id)
        : [...prev, client.id]
    );
  };

  return (
    <Sidebar>
      <SidebarContent>
        <ClientList 
          clients={clients}
          expandedClients={expandedClients}
          toggleClientExpand={toggleClientExpand}
          onClientAdded={fetchClients}
        />
        <ProjectList 
          projects={projects}
          clients={clients}
          expandedProjects={expandedProjects}
          selectedProject={selectedProject}
          toggleProjectExpand={toggleProjectExpand}
          onSelectProject={onSelectProject}
          onProjectAdded={() => {
            if (onAddProject) {
              fetchClients();
            }
          }}
        />
      </SidebarContent>
    </Sidebar>
  );
}
