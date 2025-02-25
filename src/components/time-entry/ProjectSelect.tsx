
import { Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project } from "@/types/Project";

interface ProjectSelectProps {
  projects: Project[];
  project: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setProject: (project: string) => void;
}

export function ProjectSelect({
  projects,
  project,
  open,
  setOpen,
  setProject,
}: ProjectSelectProps) {
  return (
    <div className="space-y-2 relative">
      <label htmlFor="project" className="text-sm font-medium text-gray-200">
        Progetto *
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal bg-[#1a1b26] border-[#383a5c] text-white hover:bg-[#2a2b3d] h-10"
          >
            {project
              ? projects.find((p) => p.name === project)?.name
              : "Seleziona un progetto..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 bg-[#24253a] border-[#383a5c]"
          style={{ minWidth: "unset" }}
          align="start"
        >
          <Command className="bg-transparent">
            <CommandInput placeholder="Cerca progetto..." className="text-white h-9" />
            <CommandList>
              <CommandEmpty className="text-gray-400 p-2">Nessun progetto trovato.</CommandEmpty>
              <CommandGroup>
                {projects.map((p) => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => {
                      setProject(p.name);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 hover:bg-[#2a2b3d] text-white p-2 cursor-pointer"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: p.color || "#9b87f5" }}
                    />
                    <span>{p.name}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        project === p.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
