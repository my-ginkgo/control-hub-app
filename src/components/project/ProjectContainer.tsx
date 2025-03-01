
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Lock, Globe } from "lucide-react";
import { NewProjectDialog } from "@/components/sidebar/NewProjectDialog";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/hooks/useRole";
import { updateProject } from "@/services/projectService";
import { cn } from "@/lib/utils";
import { Client } from "@/types/Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectContainerProps {
  session: Session | null;
  onProjectsUpdate: (projects: Project[]) => void;
  onSelectProject?: (project: Project) => void;
  selectedProject?: Project | null;
}

export function ProjectContainer({ 
  session, 
  onProjectsUpdate, 
  onSelectProject, 
  selectedProject 
}: ProjectContainerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
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

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchClients();
    }
  }, [session?.user?.id]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      onProjectsUpdate(data || []);
    } catch (error: any) {
      toast.error("Error fetching projects: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Error fetching clients: " + error.message);
    }
  };

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setEditFormData({
      name: project.name,
      description: project.description || "",
      clientId: project.client_id || "no_client",
      color: project.color || "#e50914",
      isPublic: project.is_public || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      // First delete related time entries
      const { error: timeEntriesError } = await supabase
        .from("time_entries")
        .delete()
        .eq("project_id", projectToDelete.id);

      if (timeEntriesError) throw timeEntriesError;

      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);

      if (projectError) throw projectError;

      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      onProjectsUpdate(projects.filter(p => p.id !== projectToDelete.id));
      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      toast.error("Error deleting project: " + error.message);
    }
  };

  const handleEditSave = async () => {
    if (!projectToEdit) return;

    const success = await updateProject(projectToEdit.id, editFormData);
    if (success) {
      fetchProjects();
      setIsEditDialogOpen(false);
      setProjectToEdit(null);
    }
  };

  const isCurrentUserProject = (project: Project) => {
    return project.user_id === session?.user?.id;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading projects...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsNewProjectDialogOpen(true)}
            variant="outline" 
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-none h-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-6 bg-[#1E1E1E] border-0 text-center">
          <p className="text-gray-400">No projects found. Create your first project to get started.</p>
          <Button 
            onClick={() => setIsNewProjectDialogOpen(true)}
            variant="outline" 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white border-none"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className={`
                p-4 bg-[#1E1E1E] border-0 cursor-pointer group
                hover:bg-[#2a2a2a] transition-colors
                ${selectedProject?.id === project.id ? 'ring-2 ring-red-600' : ''}
                ${!project.is_public && isCurrentUserProject(project) && role === "ADMIN" ? 'bg-red-900/10' : ''}
              `}
              onClick={() => handleProjectClick(project)}
              style={{ 
                borderLeft: `4px solid ${project.color || '#e50914'}` 
              }}
            >
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
                  <h3 className={cn(
                    "font-semibold text-lg",
                    !project.is_public && isCurrentUserProject(project) && role === "ADMIN"
                      ? "text-red-400"
                      : "text-white"
                  )}>
                    {project.name}
                  </h3>
                </div>
                {isCurrentUserProject(project) && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => handleEditClick(project, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500"
                      onClick={(e) => handleDeleteClick(project, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                {project.description || "No description"}
              </p>
            </Card>
          ))}
        </div>
      )}

      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        clients={clients}
        onProjectAdded={fetchProjects}
      />

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
            <DialogTitle className="text-white">Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm text-gray-400">
                Name
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
                Description
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
                Client
              </label>
              <Select
                value={editFormData.clientId}
                onValueChange={(value) => setEditFormData({ ...editFormData, clientId: value })}>
                <SelectTrigger className="bg-[#2a2b3d] border-[#383a5c] text-white">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b26] border-[#2a2b3d]">
                  <SelectItem value="no_client" className="text-white hover:bg-[#2a2b3d]">
                    No client
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
                Color
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
                Public project
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-[#2a2b3d] border-[#383a5c] text-white hover:bg-[#383a5c]">
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="bg-red-500 hover:bg-red-600 text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
