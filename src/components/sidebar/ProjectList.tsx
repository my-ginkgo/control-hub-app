
import { useState } from "react";
import { Plus, Globe, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/Project";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";
import { NewProjectDialog } from "./NewProjectDialog";
import { Client } from "@/types/Client";

interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  expandedProjects: string[];
  selectedProject?: Project;
  toggleProjectExpand: (project: Project, event: React.MouseEvent) => void;
  onSelectProject?: (project: Project) => void;
  onProjectAdded: () => void;
}

export function ProjectList({
  projects,
  clients,
  expandedProjects,
  selectedProject,
  toggleProjectExpand,
  onSelectProject,
  onProjectAdded,
}: ProjectListProps) {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const { role } = useRole();

  const isCurrentUserProject = (project: Project) => {
    return project.user_id === project.user_id; // This will be fixed in a future update
  };

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <SidebarGroup>
      <SidebarHeader className="p-4 flex justify-between items-center">
        <SidebarGroupLabel className="text-lg font-semibold text-purple-400">Progetti</SidebarGroupLabel>
        <NewProjectDialog 
          isOpen={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          clients={clients}
          onProjectAdded={onProjectAdded}
        />
      </SidebarHeader>
      <SidebarGroupContent>
        <div className="space-y-2 px-2">
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
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
