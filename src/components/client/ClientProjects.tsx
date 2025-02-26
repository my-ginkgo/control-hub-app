
import { Card } from "../ui/card";
import { Project } from "@/types/Project";

interface ClientProjectsProps {
  projects: Project[];
  isLoading: boolean;
}

export function ClientProjects({ projects, isLoading }: ClientProjectsProps) {
  return (
    <div className="h-[300px] overflow-auto border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Progetti</h3>
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-sm text-gray-500">Caricamento progetti...</div>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-4">
                <h4 className="text-base font-semibold">{project.name}</h4>
                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-sm text-gray-500">Nessun progetto associato a questo cliente.</div>
        )}
      </div>
    </div>
  );
}
