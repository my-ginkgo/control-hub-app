
import { useAuth } from "@/components/AuthProvider";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectItem } from "./projects/ProjectItem";
import { EditProjectDialog } from "./projects/EditProjectDialog";

interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  expandedProjects: string[];
  selectedProject?: Project;
  toggleProjectExpand: (project: Project, event: React.MouseEvent) => void;
  onSelectProject?: (project: Project) => void;
  onProjectAdded: () => void;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
}

export function ProjectList({
  projects,
  clients,
  expandedProjects,
  selectedProject,
  toggleProjectExpand,
  onSelectProject,
  onProjectAdded,
  onProjectDeleted,
  onProjectUpdated,
}: ProjectListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    clientId: "no_client",
    color: "",
    isPublic: false,
  });
  const { session } = useAuth();

  const isCurrentUserProject = (project: Project) => {
    return project.user_id === session?.user?.id;
  };

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const handleDeleteClick = async (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjectToEdit(project);
    setEditFormData({
      name: project.name,
      description: project.description || "",
      clientId: project.client_id || "no_client",
      color: project.color || "#4F46E5",
      isPublic: project.is_public || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const { error: timeEntriesError } = await supabase
        .from("time_entries")
        .delete()
        .eq("project_id", projectToDelete.id);

      if (timeEntriesError) throw timeEntriesError;

      const { error: projectError } = await supabase.from("projects").delete().eq("id", projectToDelete.id);

      if (projectError) throw projectError;

      toast.success("Progetto eliminato con successo");
      onProjectAdded();
      if (onProjectDeleted) {
        onProjectDeleted();
      }
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione del progetto: " + error.message);
    }
  };

  const handleEditSave = async () => {
    if (!projectToEdit) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: editFormData.name,
          description: editFormData.description,
          client_id: editFormData.clientId === "no_client" ? null : editFormData.clientId,
          color: editFormData.color,
          is_public: editFormData.isPublic,
        })
        .eq("id", projectToEdit.id);

      if (error) throw error;

      toast.success("Progetto aggiornato con successo");
      onProjectAdded();
      if (onProjectUpdated) {
        onProjectUpdated();
      }
      setIsEditDialogOpen(false);
      setProjectToEdit(null);
    } catch (error: any) {
      toast.error("Errore durante l'aggiornamento del progetto: " + error.message);
    }
  };

  return (
    <SidebarGroup className="h-[50vh] flex flex-col">
      <SidebarHeader className="p-4 pl-0">
        <SidebarGroupLabel className="text-lg font-semibold text-red-400">Progetti</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarGroupContent className="overflow-y-auto">
        <div className="space-y-2 px-2">
          {projects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              isCurrentUserProject={isCurrentUserProject(project)}
              isExpanded={expandedProjects.includes(project.id)}
              isSelected={selectedProject?.id === project.id}
              onProjectClick={handleProjectClick}
              onDeleteClick={handleDeleteClick}
              onEditClick={handleEditClick}
              toggleProjectExpand={toggleProjectExpand}
            />
          ))}
        </div>
      </SidebarGroupContent>

      {projectToDelete && (
        <DeleteProjectDialog
          project={projectToDelete}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirmDelete={handleDeleteConfirm}
        />
      )}

      <EditProjectDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        clients={clients}
        onSave={handleEditSave}
      />
    </SidebarGroup>
  );
}
