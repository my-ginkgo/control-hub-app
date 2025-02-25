
import { useState } from "react";
import { Project } from "@/types/Project";
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

interface DeleteProjectDialogProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function DeleteProjectDialog({
  project,
  isOpen,
  onOpenChange,
  onConfirmDelete,
}: DeleteProjectDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
        <DialogHeader>
          <DialogTitle className="text-white">Elimina Progetto</DialogTitle>
          <DialogDescription className="text-gray-400">
            Questa azione non può essere annullata. Verranno eliminati anche tutti i time entries associati al progetto.
            <br />
            <br />
            Digita il nome del progetto <span className="font-semibold">"{project.name}"</span> per confermare.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder="Nome del progetto"
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
            disabled={confirmationText !== project.name}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Elimina Progetto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

