
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface NewClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded: () => void;
}

export function NewClientDialog({ isOpen, onOpenChange, onClientAdded }: NewClientDialogProps) {
  const { session } = useAuth();
  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
    isPublic: false,
  });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("clients").insert({
        name: newClient.name,
        description: newClient.description,
        color: newClient.color,
        is_public: newClient.isPublic,
        user_id: session?.user?.id,
      });

      if (error) throw error;

      onClientAdded();
      setNewClient({ name: "", description: "", color: "#4F46E5", isPublic: false });
      onOpenChange(false);
      toast.success("Cliente aggiunto con successo!");
    } catch (error: any) {
      toast.error("Error adding client: " + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
        <DialogHeader>
          <DialogTitle className="text-white">Nuovo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <Label htmlFor="client-name" className="text-gray-400">
              Nome
            </Label>
            <Input
              id="client-name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="bg-[#2a2b3d] border-[#383a5c] text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="client-description" className="text-gray-400">
              Descrizione
            </Label>
            <Textarea
              id="client-description"
              value={newClient.description}
              onChange={(e) => setNewClient({ ...newClient, description: e.target.value })}
              className="bg-[#2a2b3d] border-[#383a5c] text-white"
            />
          </div>
          <div>
            <Label htmlFor="client-color" className="text-gray-400">
              Colore (opzionale)
            </Label>
            <Input
              id="client-color"
              type="color"
              value={newClient.color}
              onChange={(e) => setNewClient({ ...newClient, color: e.target.value })}
              className="bg-[#2a2b3d] border-[#383a5c] h-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="client-is-public"
              checked={newClient.isPublic}
              onCheckedChange={(checked) => setNewClient({ ...newClient, isPublic: checked })}
            />
            <Label htmlFor="client-is-public" className="text-gray-400">
              Cliente pubblico
            </Label>
          </div>
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white">
            Aggiungi Cliente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
