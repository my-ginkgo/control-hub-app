import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book } from "lucide-react";
import MarkdownIt from "markdown-it";
import { useEffect, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

// Initialize markdown parser
const mdParser = new MarkdownIt();

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
        <Button variant="outline" size="icon" className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
          <Book className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#0c0d13]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4 text-white">Documentazione</DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            <ScrollArea className="h-[calc(90vh-120px)]">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer p-3 rounded mb-2 transition-colors text-white/90 ${
                    selectedDoc === item.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedDoc(item.id)}>
                  {item.label}
                </div>
              ))}
            </ScrollArea>
          </div>
          <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
            <div className="dark">
              <MdEditor
                value={docs[selectedDoc] || ""}
                renderHTML={(text) => mdParser.render(text)}
                view={{ menu: false, md: false, html: true }}
                onChange={() => {}}
                style={{ border: "none" }}
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
