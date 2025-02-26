
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";

interface EditProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editFormData: {
    name: string;
    description: string;
    clientId: string;
    color: string;
    isPublic: boolean;
  };
  setEditFormData: (data: {
    name: string;
    description: string;
    clientId: string;
    color: string;
    isPublic: boolean;
  }) => void;
  clients: Client[];
  onSave: () => Promise<void>;
}

export function EditProjectDialog({
  isOpen,
  setIsOpen,
  editFormData,
  setEditFormData,
  clients,
  onSave,
}: EditProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
        <DialogHeader>
          <DialogTitle className="text-white">Modifica Progetto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm text-gray-400">
              Nome
            </label>
            <Input
              id="name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="bg-[#2a2b3d] border-[#383a5c] text-white"
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm text-gray-400">
              Descrizione
            </label>
            <Textarea
              id="description"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="bg-[#2a2b3d] border-[#383a5c] text-white h-24"
            />
          </div>
          <div>
            <label htmlFor="client" className="text-sm text-gray-400">
              Cliente
            </label>
            <Select
              value={editFormData.clientId}
              onValueChange={(value) => setEditFormData({ ...editFormData, clientId: value })}>
              <SelectTrigger className="bg-[#2a2b3d] border-[#383a5c] text-white">
                <SelectValue placeholder="Seleziona un cliente" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1b26] border-[#2a2b3d]">
                <SelectItem value="no_client" className="text-white hover:bg-[#2a2b3d]">
                  Nessun cliente
                </SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="text-white hover:bg-[#2a2b3d]">
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="color" className="text-sm text-gray-400">
              Colore
            </label>
            <Input
              id="color"
              type="color"
              value={editFormData.color}
              onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
              className="bg-[#2a2b3d] border-[#383a5c] h-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is-public"
              checked={editFormData.isPublic}
              onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPublic: checked })}
            />
            <label htmlFor="is-public" className="text-sm text-gray-400">
              Progetto pubblico
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="bg-[#2a2b3d] border-[#383a5c] text-white hover:bg-[#383a5c]">
            Annulla
          </Button>
          <Button onClick={onSave} className="bg-red-500 hover:bg-red-600 text-white">
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
