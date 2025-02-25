
import { useState } from "react";
import { Plus, Globe, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Project } from "@/types/Project";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/components/AuthProvider";

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
  const [isOpen, setIsOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const { role } = useRole();
  const { session } = useAuth();
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
    isPublic: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject(newProject);
    setNewProject({ name: "", description: "", color: "#4F46E5", isPublic: false });
    setIsOpen(false);
  };

  const toggleProjectExpand = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedProjects((prev) =>
      prev.includes(project.id)
        ? prev.filter((id) => id !== project.id)
        : [...prev, project.id]
    );
  };

  const isCurrentUserProject = (project: Project) => {
    return project.user_id === session?.user?.id;
  };

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-purple-400">Progetti</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-black/20 border-0 hover:bg-black/40"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
            <DialogHeader>
              <DialogTitle className="text-white">Nuovo Progetto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-400">Nome</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="bg-[#2a2b3d] border-[#383a5c] text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-400">Descrizione</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="bg-[#2a2b3d] border-[#383a5c] text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="color" className="text-gray-400">Colore (opzionale)</Label>
                <Input
                  id="color"
                  type="color"
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
                  }
                  className="bg-[#2a2b3d] border-[#383a5c] h-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={newProject.isPublic}
                  onCheckedChange={(checked) =>
                    setNewProject({ ...newProject, isPublic: checked })
                  }
                />
                <Label htmlFor="is-public" className="text-gray-400">Progetto pubblico</Label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Aggiungi Progetto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="space-y-2 py-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                "group rounded-lg transition-all duration-200",
                "hover:bg-black/20",
                !project.is_public && isCurrentUserProject(project) && role === "ADMIN" && "bg-purple-500/10 hover:bg-purple-500/20",
                selectedProject?.id === project.id && "bg-purple-500/20"
              )}
            >
              <div
                className="p-3 cursor-pointer"
                onClick={() => handleProjectClick(project)}
                style={{
                  borderLeft: `4px solid ${project.color || "#4F46E5"}`,
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-medium",
                      !project.is_public && isCurrentUserProject(project) && role === "ADMIN" 
                        ? "text-purple-400" 
                        : "text-gray-200"
                    )}>
                      {project.name}
                    </h3>
                    {project.is_public ? (
                      <Globe className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Lock className={cn(
                        "h-4 w-4",
                        isCurrentUserProject(project) && role === "ADMIN" 
                          ? "text-purple-400" 
                          : "text-gray-400"
                      )} />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={(e) => toggleProjectExpand(project, e)}
                  >
                    {expandedProjects.includes(project.id) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <div
                  className={cn(
                    "text-sm text-gray-400 overflow-hidden transition-all duration-200",
                    expandedProjects.includes(project.id)
                      ? "max-h-24 mt-2"
                      : "max-h-0 opacity-0"
                  )}
                >
                  {project.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
