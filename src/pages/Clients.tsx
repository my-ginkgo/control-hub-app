
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Client } from "@/types/Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar/context";

export default function Clients() {
  const { session } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientProjects, setClientProjects] = useState<Record<string, number>>({});

  useEffect(() => {
    if (session) {
      fetchClients();
    }
  }, [session]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (error) throw error;
      
      if (data) {
        setClients(data);
        fetchProjectsCount(data);
      }
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      toast.error("Error fetching clients");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectsCount = async (clientsData: Client[]) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("client_id");

      if (error) throw error;
      
      if (data) {
        const counts: Record<string, number> = {};
        
        data.forEach(project => {
          if (project.client_id) {
            counts[project.client_id] = (counts[project.client_id] || 0) + 1;
          }
        });
        
        setClientProjects(counts);
      }
    } catch (error: any) {
      console.error("Error fetching project counts:", error.message);
    }
  };

  const handleNewClient = () => {
    toast.info("Create new client feature will be implemented soon");
  };

  const handleNewProject = () => {
    toast.info("Create new project feature will be implemented soon");
  };

  const handleNewTimeEntry = () => {
    toast.info("Usa la pagina di Time Tracking per registrare lavoro");
  };

  return (
    <SidebarProvider>
      <MainLayout 
        onNewClient={handleNewClient}
        onNewProject={handleNewProject}
        onNewTimeEntry={handleNewTimeEntry}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Clienti</h1>
            <Button 
              onClick={handleNewClient}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Cliente
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-[#1a1b26] border-[#2a2b3d] text-white h-48 animate-pulse">
                  <CardContent className="p-6"></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {clients.length === 0 ? (
                <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <Building className="h-16 w-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nessun cliente</h3>
                    <p className="text-gray-400 mb-4 text-center">
                      Non hai ancora creato nessun cliente. Inizia creando il tuo primo cliente.
                    </p>
                    <Button 
                      onClick={handleNewClient}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crea Cliente
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <Link key={client.id} to={`/client/${client.id}`}>
                      <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white hover:bg-[#22232e] transition-colors cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center text-red-600">
                            <Building className="h-5 w-5 mr-2" />
                            {client.name}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {clientProjects[client.id] ? `${clientProjects[client.id]} progetti` : "Nessun progetto"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 line-clamp-2">
                            {client.description || "Nessuna descrizione"}
                          </p>
                        </CardContent>
                        <CardFooter className="border-t border-[#2a2b3d] pt-3">
                          <div className="flex items-center text-sm text-gray-400">
                            <Users className="h-4 w-4 mr-1" />
                            Visualizza dettagli
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </MainLayout>
    </SidebarProvider>
  );
}
