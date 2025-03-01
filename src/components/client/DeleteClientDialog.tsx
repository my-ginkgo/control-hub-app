
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
import { AlertCircle } from "lucide-react";

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
  const confirmationWord = "conferma"; // The word user needs to type

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-destructive/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Elimina Cliente
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Questa azione non può essere annullata. Verranno eliminati anche tutti i progetti e i time entries associati al cliente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20 my-2">
          <p className="text-sm text-foreground mb-4">
            Per confermare l'eliminazione, digita <span className="font-bold text-destructive">{confirmationWord}</span> nel campo sottostante.
          </p>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={`Digita "${confirmationWord}"`}
            className="bg-background/50 border-input"
          />
        </div>
        
        <DialogFooter className="gap-2 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button
            onClick={onConfirmDelete}
            disabled={confirmationText.toLowerCase() !== confirmationWord}
            variant="destructive"
          >
            Elimina Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
