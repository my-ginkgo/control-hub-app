
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export const DocsDialog = () => {
  const [docs, setDocs] = useState<{ [key: string]: string }>({});
  const [selectedDoc, setSelectedDoc] = useState<string>("permissions");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const permissionsModule = await import("@/docs/permissions.md?raw");
        setDocs({
          permissions: permissionsModule.default,
        });
      } catch (error) {
        console.error("Error loading documentation:", error);
      }
    };

    loadDocs();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-[#383a5c] text-white hover:bg-[#2a2b3d]"
        >
          <Book className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Documentazione
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <div className="w-48 shrink-0">
            <div
              className={`cursor-pointer p-2 rounded ${
                selectedDoc === "permissions"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => setSelectedDoc("permissions")}
            >
              Permessi
            </div>
          </div>
          <div className="flex-1 prose prose-invert max-w-none">
            <ReactMarkdown>{docs[selectedDoc] || ""}</ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
