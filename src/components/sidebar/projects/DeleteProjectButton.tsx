
import { Button } from "@/components/ui/button";
import { Project } from "@/types/Project";
import { Trash2 } from "lucide-react";

interface DeleteProjectButtonProps {
  project: Project;
  isCurrentUserProject: boolean;
  onDeleteClick: (project: Project, event: React.MouseEvent) => void;
}

export function DeleteProjectButton({
  project,
  isCurrentUserProject,
  onDeleteClick,
}: DeleteProjectButtonProps) {
  if (!isCurrentUserProject) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
      onClick={(e) => onDeleteClick(project, e)}>
      <Trash2 className="h-4 w-4 text-gray-400" />
    </Button>
  );
}
