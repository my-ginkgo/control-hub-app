
import { Button } from "@/components/ui/button";
import { Project } from "@/types/Project";
import { Pencil } from "lucide-react";

interface EditProjectButtonProps {
  project: Project;
  isCurrentUserProject: boolean;
  onEditClick: (project: Project, event: React.MouseEvent) => void;
}

export function EditProjectButton({
  project,
  isCurrentUserProject,
  onEditClick,
}: EditProjectButtonProps) {
  if (!isCurrentUserProject) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
      onClick={(e) => onEditClick(project, e)}>
      <Pencil className="h-4 w-4 text-gray-400" />
    </Button>
  );
}
