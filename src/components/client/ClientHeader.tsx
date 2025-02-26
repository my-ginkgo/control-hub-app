
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Client } from "@/types/Client";

interface ClientHeaderProps {
  client: Client;
  onBack: () => void;
  onDelete: () => void;
}

export function ClientHeader({ client, onBack, onDelete }: ClientHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Torna alla dashboard</h2>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="bg-red-500 hover:bg-red-600">
        <Trash2 className="h-4 w-4 mr-2" />
        Elimina Cliente
      </Button>
    </div>
  );
}
