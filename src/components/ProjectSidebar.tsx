
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface ProjectSidebarProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, "id">) => void;
}

export function ProjectSidebar({ projects, onAddProject }: ProjectSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject(newProject);
    setNewProject({ name: "", description: "", color: "#4F46E5" });
    setIsOpen(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Progetti</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Progetto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Colore (opzionale)</Label>
                <Input
                  id="color"
                  type="color"
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Aggiungi Progetto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-3 rounded-lg hover:bg-accent cursor-pointer"
              style={{
                borderLeft: `4px solid ${project.color || "#4F46E5"}`,
              }}
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
