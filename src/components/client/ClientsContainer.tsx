
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { NewClientDialog } from "@/components/sidebar/NewClientDialog";
import { DeleteClientDialog } from "@/components/client/DeleteClientDialog";

interface ClientsContainerProps {
  onSelectClient?: (client: Client) => void;
  selectedClient?: Client | null;
}

export function ClientsContainer({ onSelectClient, selectedClient }: ClientsContainerProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchClients();
    }
  }, [session?.user?.id]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Error fetching clients: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientClick = (client: Client) => {
    if (onSelectClient) {
      onSelectClient(client);
    }
  };

  const handleDeleteClick = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      // First check if there are any projects associated with this client
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("client_id", clientToDelete.id)
        .limit(1);

      if (projectError) throw projectError;

      if (projectData && projectData.length > 0) {
        return toast.error("Cannot delete client with associated projects. Please remove projects first.");
      }

      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (error) throw error;

      setClients(clients.filter(c => c.id !== clientToDelete.id));
      toast.success("Client deleted successfully");
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error: any) {
      toast.error("Error deleting client: " + error.message);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading clients...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsNewClientDialogOpen(true)}
            variant="outline" 
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-none h-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card className="p-6 bg-[#1E1E1E] border-0 text-center">
          <p className="text-gray-400">No clients found. Create your first client to get started.</p>
          <Button 
            onClick={() => setIsNewClientDialogOpen(true)}
            variant="outline" 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white border-none"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Client
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card 
              key={client.id}
              className={`
                p-4 bg-[#1E1E1E] border-0 cursor-pointer group
                hover:bg-[#2a2a2a] transition-colors
                ${selectedClient?.id === client.id ? 'ring-2 ring-red-600' : ''}
              `}
              onClick={() => handleClientClick(client)}
              style={{ 
                borderLeft: `4px solid ${client.color || '#e50914'}` 
              }}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-white">{client.name}</h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit click - can be added later
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500"
                    onClick={(e) => handleDeleteClick(client, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                {client.description || "No description"}
              </p>
            </Card>
          ))}
        </div>
      )}

      <NewClientDialog
        isOpen={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
        onClientAdded={fetchClients}
      />

      <DeleteClientDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        client={clientToDelete}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
}
