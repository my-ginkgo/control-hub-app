
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColorConfigurator } from "@/components/ColorConfigurator";
import { Settings2 } from "lucide-react";

export default function Index() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurazione Colori</DialogTitle>
            </DialogHeader>
            <ColorConfigurator />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

