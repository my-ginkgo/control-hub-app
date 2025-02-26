
import { cn } from "@/lib/utils";
import { Project } from "@/types/Project";
import { ChevronDown, ChevronUp, Globe, Lock } from "lucide-react";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { EditProjectButton } from "./EditProjectButton";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";

interface ProjectItemProps {
  project: Project;
  isCurrentUserProject: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  onProjectClick: (project: Project) => void;
  onDeleteClick: (project: Project, event: React.MouseEvent) => void;
  onEditClick: (project: Project, event: React.MouseEvent) => void;
  toggleProjectExpand: (project: Project, event: React.MouseEvent) => void;
}

export function ProjectItem({
  project,
  isCurrentUserProject,
  isExpanded,
  isSelected,
  onProjectClick,
  onDeleteClick,
  onEditClick,
  toggleProjectExpand,
}: ProjectItemProps) {
  const { role } = useRole();

  return (
    <div
      className={cn(
        "group/item rounded-lg transition-all duration-200",
        "hover:bg-black/20",
        !project.is_public && isCurrentUserProject && role === "ADMIN" && "bg-red-500/10 hover:bg-red-500/20",
        isSelected && "bg-red-500/20"
      )}>
      <div
        className="p-3 cursor-pointer"
        onClick={() => onProjectClick(project)}
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
                  isCurrentUserProject && role === "ADMIN" ? "text-red-400" : "text-gray-400"
                )}
              />
            )}
            <h3
              className={cn(
                "font-medium",
                !project.is_public && isCurrentUserProject && role === "ADMIN"
                  ? "text-red-400"
                  : "text-gray-200"
              )}>
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <EditProjectButton
              project={project}
              isCurrentUserProject={isCurrentUserProject}
              onEditClick={onEditClick}
            />
            <DeleteProjectButton
              project={project}
              isCurrentUserProject={isCurrentUserProject}
              onDeleteClick={onDeleteClick}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => toggleProjectExpand(project, e)}>
              {isExpanded ? (
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
            isExpanded ? "max-h-24 mt-2" : "max-h-0 opacity-0"
          )}>
          {project.description}
        </div>
      </div>
    </div>
  );
}
