
import { useState } from "react";
import { Plus, Globe, Lock, ChevronDown, ChevronUp, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/Client";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "@/components/ui/sidebar";
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
  selectedClient
}: ClientListProps) {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const { role } = useRole();

  const isCurrentUserClient = (client: Client) => {
    return client.user_id === client.user_id; // This will be fixed in a future update
  };

  const handleClientClick = (client: Client, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest("button")) {
      if (onSelectClient) {
        onSelectClient(client);
      }
    }
  };

  return (
    <SidebarGroup className="h-[50vh] flex flex-col">
      <SidebarHeader className="p-4 flex justify-between items-center shrink-0">
        <SidebarGroupLabel className="text-lg font-semibold text-purple-400">Clienti</SidebarGroupLabel>
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
                "group rounded-lg transition-all duration-200 cursor-pointer",
                "hover:bg-black/20",
                !client.is_public && isCurrentUserClient(client) && role === "ADMIN" && "bg-purple-500/10 hover:bg-purple-500/20",
                selectedClient?.id === client.id && "bg-purple-500/20"
              )}
            >
              <div
                className="p-3"
                style={{
                  borderLeft: `4px solid ${client.color || "#4F46E5"}`,
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <h3 className={cn(
                      "font-medium",
                      !client.is_public && isCurrentUserClient(client) && role === "ADMIN" 
                        ? "text-purple-400" 
                        : "text-gray-200"
                    )}>
                      {client.name}
                    </h3>
                    {client.is_public ? (
                      <Globe className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Lock className={cn(
                        "h-4 w-4",
                        isCurrentUserClient(client) && role === "ADMIN" 
                          ? "text-purple-400" 
                          : "text-gray-400"
                      )} />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={(e) => toggleClientExpand(client, e)}
                  >
                    {expandedClients.includes(client.id) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <div
                  className={cn(
                    "text-sm text-gray-400 overflow-hidden transition-all duration-200",
                    expandedClients.includes(client.id)
                      ? "max-h-24 mt-2"
                      : "max-h-0 opacity-0"
                  )}
                >
                  {client.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
