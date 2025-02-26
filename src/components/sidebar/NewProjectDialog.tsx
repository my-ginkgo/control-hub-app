import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onProjectAdded: () => void;
}

export function NewProjectDialog({ isOpen, onOpenChange, clients, onProjectAdded }: NewProjectDialogProps) {
  const { session } = useAuth();
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
    isPublic: false,
    clientId: "",
  });

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("projects").insert({
        name: newProject.name,
        description: newProject.description,
        color: newProject.color,
        is_public: newProject.isPublic,
        user_id: session?.user?.id,
        client_id: newProject.clientId || null,
      });

      if (error) throw error;

      onProjectAdded();
      setNewProject({ name: "", description: "", color: "#4F46E5", isPublic: false, clientId: "" });
      onOpenChange(false);
      toast.success("Progetto aggiunto con successo!");
    } catch (error: any) {
      toast.error("Error adding project: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogPortal>
        <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
          <DialogHeader>
            <DialogTitle className="text-white">Nuovo Progetto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-400">
                Nome
              </Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="bg-[#2a2b3d] border-[#383a5c] text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-400">
                Descrizione
              </Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="bg-[#2a2b3d] border-[#383a5c] text-white"
              />
            </div>
            <div>
              <Label htmlFor="client" className="text-gray-400">
                Cliente
              </Label>
              <select
                id="client"
                value={newProject.clientId}
                onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                className="w-full bg-[#2a2b3d] border-[#383a5c] text-white rounded-md p-2">
                <option value="">Seleziona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="color" className="text-gray-400">
                Colore (opzionale)
              </Label>
              <Input
                id="color"
                type="color"
                value={newProject.color}
                onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                className="bg-[#2a2b3d] border-[#383a5c] h-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-public"
                checked={newProject.isPublic}
                onCheckedChange={(checked) => setNewProject({ ...newProject, isPublic: checked })}
              />
              <Label htmlFor="is-public" className="text-gray-400">
                Progetto pubblico
              </Label>
            </div>
            <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white">
              Aggiungi Progetto
            </Button>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
