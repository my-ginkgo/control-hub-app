import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Client } from "@/types/Client";
import { ChevronDown, ChevronUp, Globe, Lock, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../AuthProvider";
import { DeleteClientDialog } from "../client/DeleteClientDialog";
import { NewClientDialog } from "./NewClientDialog";

interface ClientListProps {
  clients: Client[];
  expandedClients: string[];
  toggleClientExpand: (client: Client, event: React.MouseEvent) => void;
  onClientAdded: () => void;
  onSelectClient?: (client: Client) => void;
  selectedClient?: Client;
}

export function ClientList({
  clients,
  expandedClients,
  toggleClientExpand,
  onClientAdded,
  onSelectClient,
  selectedClient,
}: ClientListProps) {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const { role } = useRole();
  const { session } = useAuth();

  const isCurrentUserClient = (client: Client) => {
    return client.user_id === session?.user?.id;
  };

  const handleClientClick = (client: Client, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest("button")) {
      if (onSelectClient) {
        onSelectClient(client);
      }
    }
  };

  const handleDeleteClick = (client: Client, event: React.MouseEvent) => {
    event.stopPropagation();
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientToDelete.id);

      if (error) throw error;

      toast.success("Cliente eliminato con successo");
      onClientAdded();
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione del cliente: " + error.message);
    }
  };

  return (
    <SidebarGroup className="h-[50vh] flex flex-col">
      <SidebarHeader className="p-4 flex justify-between items-center shrink-0">
        <SidebarGroupLabel className="text-lg font-semibold text-red-400">Clienti</SidebarGroupLabel>
        <NewClientDialog
          isOpen={isClientDialogOpen}
          onOpenChange={setIsClientDialogOpen}
          onClientAdded={onClientAdded}
        />
      </SidebarHeader>
      <SidebarGroupContent className="overflow-y-auto">
        <div className="space-y-2 px-2">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={(e) => handleClientClick(client, e)}
              className={cn(
                "group/item rounded-lg transition-all duration-200 cursor-pointer",
                "hover:bg-black/20",
                !client.is_public &&
                  isCurrentUserClient(client) &&
                  role === "ADMIN" &&
                  "bg-red-500/10 hover:bg-red-500/20",
                selectedClient?.id === client.id && "bg-red-500/20"
              )}>
              <div
                className="p-3"
                style={{
                  borderLeft: `4px solid ${client.color || "#4F46E5"}`,
                }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {client.is_public ? (
                      <Globe className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Lock
                        className={cn(
                          "h-4 w-4",
                          isCurrentUserClient(client) && role === "ADMIN" ? "text-red-400" : "text-gray-400"
                        )}
                      />
                    )}
                    <h3
                      className={cn(
                        "font-medium",
                        !client.is_public && isCurrentUserClient(client) && role === "ADMIN"
                          ? "text-red-400"
                          : "text-gray-200"
                      )}>
                      {client.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrentUserClient(client) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteClick(client, e)}>
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={(e) => toggleClientExpand(client, e)}>
                      {expandedClients.includes(client.id) ? (
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
                    expandedClients.includes(client.id) ? "max-h-24 mt-2" : "max-h-0 opacity-0"
                  )}>
                  {client.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SidebarGroupContent>

      {clientToDelete && (
        <DeleteClientDialog
          client={clientToDelete}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirmDelete={handleDeleteConfirm}
        />
      )}
    </SidebarGroup>
  );
}
