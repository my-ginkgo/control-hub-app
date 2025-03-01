
import { Label } from "@/components/ui/label";
import { Project } from "@/types/Project";
import { ProjectSelect } from "../ProjectSelect";

interface ProjectSectionProps {
  projects: Project[];
  selectedProject_: string;
  setSelectedProject: (project: string) => void;
  selectedProject: Project | null;
}

export function ProjectSection({
  projects,
  selectedProject_,
  setSelectedProject,
  selectedProject
}: ProjectSectionProps) {
  return (
    <div>
      <ProjectSelect 
        projects={projects} 
        selectedProject={selectedProject_} 
        onProjectChange={setSelectedProject} 
      />
    </div>
  );
}
