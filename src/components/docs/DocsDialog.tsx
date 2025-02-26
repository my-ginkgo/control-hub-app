
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
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { ScrollArea } from "@/components/ui/scroll-area";

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
          <DialogTitle className="text-2xl font-bold mb-4 text-white">
            Documentazione
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            <ScrollArea className="h-[calc(90vh-120px)]">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`cursor-pointer p-3 rounded mb-2 transition-colors text-white/90 ${
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
            <div className="dark">
              <MdEditor
                value={docs[selectedDoc] || ""}
                renderHTML={(text) => mdParser.render(text)}
                view={{ menu: false, md: false, html: true }}
                onChange={() => {}}
                style={{ border: 'none', backgroundColor: 'transparent' }}
                className="!bg-transparent [&_.rc-md-navigation]:hidden [&_.section-container]:!bg-transparent [&_.custom-html-style]:!bg-transparent [&_.custom-html-style]:prose [&_.custom-html-style]:prose-invert [&_.custom-html-style]:max-w-none [&_.custom-html-style]:prose-headings:mt-8 [&_.custom-html-style]:prose-headings:mb-4 [&_.custom-html-style]:prose-h1:text-4xl [&_.custom-html-style]:prose-h1:font-bold [&_.custom-html-style]:prose-h1:text-white [&_.custom-html-style]:prose-h2:text-2xl [&_.custom-html-style]:prose-h2:font-semibold [&_.custom-html-style]:prose-h2:text-white [&_.custom-html-style]:prose-h3:text-xl [&_.custom-html-style]:prose-h3:font-medium [&_.custom-html-style]:prose-h3:text-white [&_.custom-html-style]:prose-p:my-3 [&_.custom-html-style]:prose-p:leading-relaxed [&_.custom-html-style]:prose-p:text-white [&_.custom-html-style]:prose-ul:my-4 [&_.custom-html-style]:prose-ul:space-y-2 [&_.custom-html-style]:prose-li:my-0 [&_.custom-html-style]:prose-li:text-white [&_.custom-html-style]:prose-strong:text-white [&_.custom-html-style]:prose-em:text-white [&_.custom-html-style]:[&>h2]:border-b [&_.custom-html-style]:[&>h2]:border-white/10 [&_.custom-html-style]:[&>h2]:pb-2"
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

