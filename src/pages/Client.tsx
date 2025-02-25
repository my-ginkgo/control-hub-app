
import { useState, useEffect } from "react";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TimeTable } from "@/components/TimeTable";
import { TimeEntryData } from "@/components/TimeEntry";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/components/AuthProvider";

export function ClientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useRole();
  const { session } = useAuth();

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);

      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (clientError) throw clientError;
      
      setClient(clientData);

      // Fetch associated projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      
      setProjects(projectsData || []);

    } catch (error: any) {
      toast.error("Errore nel caricamento dei dati del cliente: " + error.message);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (!id) {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna alla Dashboard
      </Button>

      <Card>
        <CardHeader>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : (
            <>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {client?.name}
              </CardTitle>
              {client?.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {client.description}
                </p>
              )}
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Progetti del Cliente</h3>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {project.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nessun progetto associato a questo cliente.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
