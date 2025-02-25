
import { useState, useEffect } from "react";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientList } from "./sidebar/ClientList";
import { ProjectList } from "./sidebar/ProjectList";
import { ClientDashboard } from "./ClientDashboard";

interface ProjectSidebarProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onSelectProject?: (project: Project) => void;
  selectedProject?: Project;
  selectedClient?: Client;
  onSelectClient?: (client: Client) => void;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
}

export function ProjectSidebar({ 
  projects, 
  onAddProject, 
  onSelectProject,
  selectedProject,
  selectedClient,
  onSelectClient,
  onProjectDeleted,
  onProjectUpdated
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

  const handleSelectClient = (client: Client) => {
    if (onSelectClient) {
      onSelectClient(client);
    }
    if (onSelectProject && selectedProject) {
      onSelectProject(undefined);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <ClientList 
          clients={clients}
          expandedClients={expandedClients}
          toggleClientExpand={toggleClientExpand}
          onClientAdded={fetchClients}
          onSelectClient={handleSelectClient}
          selectedClient={selectedClient}
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
          onProjectDeleted={onProjectDeleted}
          onProjectUpdated={onProjectUpdated}
        />
      </SidebarContent>
    </Sidebar>
  );
}
