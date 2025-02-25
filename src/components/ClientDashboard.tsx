
import { useEffect, useState } from "react";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

interface ClientDashboardProps {
  client: Client;
  onBack: () => void;
}

export function ClientDashboard({ client, onBack }: ClientDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [client.id]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
      setIsLoading(false);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei progetti: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Torna alla dashboard</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-400" />
            <CardTitle>{client.name}</CardTitle>
          </div>
          {client.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {client.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Progetti</h3>
            <div className="grid gap-4">
              {isLoading ? (
                <div className="text-sm text-gray-500">Caricamento progetti...</div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {project.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  Nessun progetto associato a questo cliente.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
