
import { Building } from "lucide-react";
import { CardHeader, CardTitle } from "../ui/card";
import { Client } from "@/types/Client";

interface ClientInfoProps {
  client: Client;
}

export function ClientInfo({ client }: ClientInfoProps) {
  return (
    <CardHeader>
      <div className="flex items-center gap-2">
        <Building className="h-5 w-5 text-red-400" />
        <CardTitle>{client.name}</CardTitle>
      </div>
      {client.description && <p className="text-sm text-gray-500 dark:text-gray-400">{client.description}</p>}
    </CardHeader>
  );
}
