
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
import { ScrollArea } from "@/components/ui/scroll-area";

export const DocsDialog = () => {
  const [docs, setDocs] = useState<{ [key: string]: string }>({});
  const [selectedDoc, setSelectedDoc] = useState<string>("permissions");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const [permissionsModule, projectsModule, timetrackingModule] = await Promise.all([
          import("@/docs/permissions.md?raw"),
          import("@/docs/projects.md?raw"),
          import("@/docs/timetracking.md?raw"),
        ]);

        setDocs({
          permissions: permissionsModule.default,
          projects: projectsModule.default,
          timetracking: timetrackingModule.default,
        });
      } catch (error) {
        console.error("Error loading documentation:", error);
      }
    };

    loadDocs();
  }, []);

  const menuItems = [
    { id: "permissions", label: "Permessi" },
    { id: "projects", label: "Progetti" },
    { id: "timetracking", label: "Time Tracking" },
  ];

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
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#0c0d13]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            Documentazione
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            <ScrollArea className="h-[calc(90vh-120px)]">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer p-3 rounded mb-2 transition-colors ${
                    selectedDoc === item.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedDoc(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </ScrollArea>
          </div>
          <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
            <div className="prose prose-invert max-w-none pr-6 prose-headings:mt-8 prose-headings:mb-4 prose-h1:text-4xl prose-h1:font-bold prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-medium prose-p:my-3 prose-p:leading-relaxed prose-ul:my-4 prose-ul:space-y-2 prose-li:my-0 prose-strong:text-white/90 prose-em:text-white/90 [&>h2]:border-b [&>h2]:border-white/10 [&>h2]:pb-2">
              <ReactMarkdown>{docs[selectedDoc] || ""}</ReactMarkdown>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
