
import { useState } from "react";
import { Client } from "@/types/Client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteClientDialogProps {
  client: Client;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeleteClientDialog({
  client,
  isOpen,
  onOpenChange,
  onConfirmDelete,
}: DeleteClientDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
        <DialogHeader>
          <DialogTitle className="text-white">Elimina Cliente</DialogTitle>
          <DialogDescription className="text-gray-400">
            Questa azione non può essere annullata. Verranno eliminati anche tutti i progetti e i time entries associati al cliente.
            <br />
            <br />
            Digita il nome del cliente <span className="font-semibold">"{client.name}"</span> per confermare.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="Nome del cliente"
          className="bg-[#2a2b3d] border-[#383a5c] text-white"
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#2a2b3d] border-[#383a5c] text-white hover:bg-[#383a5c]"
          >
            Annulla
          </Button>
          <Button
            onClick={onConfirmDelete}
            disabled={confirmationText !== client.name}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Elimina Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
