
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar/context";
import { ClientDashboard } from "@/components/ClientDashboard";
import { useAuth } from "@/components/AuthProvider";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session && id) {
      fetchClient(id);
    }
  }, [id, session]);

  const fetchClient = async (clientId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      console.error("Error fetching client:", error.message);
      toast.error("Errore nel caricamento del cliente");
      navigate("/clients");
    } finally {
      setIsLoading(false);
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

  const handleBack = () => {
    navigate("/clients");
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <MainLayout 
          onNewClient={handleNewClient}
          onNewProject={handleNewProject}
          onNewTimeEntry={handleNewTimeEntry}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </MainLayout>
      </SidebarProvider>
    );
  }

  if (!client) {
    return (
      <SidebarProvider>
        <MainLayout 
          onNewClient={handleNewClient}
          onNewProject={handleNewProject}
          onNewTimeEntry={handleNewTimeEntry}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-red-500">
              <h2 className="text-2xl font-bold">Cliente non trovato</h2>
              <p className="mt-2">Il cliente richiesto non esiste o non hai i permessi per visualizzarlo.</p>
            </div>
          </div>
        </MainLayout>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <MainLayout 
        onNewClient={handleNewClient}
        onNewProject={handleNewProject}
        onNewTimeEntry={handleNewTimeEntry}
      >
        <div className="container mx-auto px-4 py-6">
          <ClientDashboard client={client} onBack={handleBack} />
        </div>
      </MainLayout>
    </SidebarProvider>
  );
}
