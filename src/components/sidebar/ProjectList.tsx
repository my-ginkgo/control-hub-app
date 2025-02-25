import { useAuth } from "@/components/AuthProvider";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { ChevronDown, ChevronUp, Globe, Lock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NewProjectDialog } from "./NewProjectDialog";

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
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
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
  const { role } = useRole();
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
      <SidebarHeader className="p-4 flex justify-between items-center shrink-0">
        <SidebarGroupLabel className="text-lg font-semibold text-red-400">Progetti</SidebarGroupLabel>
        <NewProjectDialog
          isOpen={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          clients={clients}
          onProjectAdded={onProjectAdded}
        />
      </SidebarHeader>
      <SidebarGroupContent className="overflow-y-auto">
        <div className="space-y-2 px-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "group/item rounded-lg transition-all duration-200",
                "hover:bg-black/20",
                !project.is_public &&
                  isCurrentUserProject(project) &&
                  role === "ADMIN" &&
                  "bg-red-500/10 hover:bg-red-500/20",
                selectedProject?.id === project.id && "bg-red-500/20"
              )}>
              <div
                className="p-3 cursor-pointer"
                onClick={() => handleProjectClick(project)}
                style={{
                  borderLeft: `4px solid ${project.color || "#4F46E5"}`,
                }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {project.is_public ? (
                      <Globe className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Lock
                        className={cn(
                          "h-4 w-4",
                          isCurrentUserProject(project) && role === "ADMIN" ? "text-red-400" : "text-gray-400"
                        )}
                      />
                    )}
                    <h3
                      className={cn(
                        "font-medium",
                        !project.is_public && isCurrentUserProject(project) && role === "ADMIN"
                          ? "text-red-400"
                          : "text-gray-200"
                      )}>
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrentUserProject(project) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          onClick={(e) => handleEditClick(project, e)}>
                          <Pencil className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteClick(project, e)}>
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={(e) => toggleProjectExpand(project, e)}>
                      {expandedProjects.includes(project.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div
                  className={cn(
                    "text-sm text-gray-400 overflow-hidden transition-all duration-200",
                    expandedProjects.includes(project.id) ? "max-h-24 mt-2" : "max-h-0 opacity-0"
                  )}>
                  {project.description}
                </div>
              </div>
            </div>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
          <DialogHeader>
            <DialogTitle className="text-white">Modifica Progetto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm text-gray-400">
                Nome
              </label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="bg-[#2a2b3d] border-[#383a5c] text-white"
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm text-gray-400">
                Descrizione
              </label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="bg-[#2a2b3d] border-[#383a5c] text-white h-24"
              />
            </div>
            <div>
              <label htmlFor="client" className="text-sm text-gray-400">
                Cliente
              </label>
              <Select
                value={editFormData.clientId}
                onValueChange={(value) => setEditFormData({ ...editFormData, clientId: value })}>
                <SelectTrigger className="bg-[#2a2b3d] border-[#383a5c] text-white">
                  <SelectValue placeholder="Seleziona un cliente" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b26] border-[#2a2b3d]">
                  <SelectItem value="no_client" className="text-white hover:bg-[#2a2b3d]">
                    Nessun cliente
                  </SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-white hover:bg-[#2a2b3d]">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="color" className="text-sm text-gray-400">
                Colore
              </label>
              <Input
                id="color"
                type="color"
                value={editFormData.color}
                onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                className="bg-[#2a2b3d] border-[#383a5c] h-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-public"
                checked={editFormData.isPublic}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPublic: checked })}
              />
              <label htmlFor="is-public" className="text-sm text-gray-400">
                Progetto pubblico
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-[#2a2b3d] border-[#383a5c] text-white hover:bg-[#383a5c]">
              Annulla
            </Button>
            <Button onClick={handleEditSave} className="bg-red-500 hover:bg-red-600 text-white">
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}
