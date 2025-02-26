
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Plus, Sun, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "../ui/sidebar";
import { useTheme } from "../ThemeProvider";
import { DocsDialog } from "../docs/DocsDialog";
import { ColorWidget } from "../user/ColorWidget";

interface MainLayoutProps {
  children: React.ReactNode;
  onNewClient: () => void;
  onNewProject: () => void;
  onNewTimeEntry: () => void;
}

export function MainLayout({ children, onNewClient, onNewProject, onNewTimeEntry }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="bg-popover hover:bg-muted text-popover-foreground" />
          <img src="logo.png" alt="Logo" className="w-12 h-12" />
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Crea
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem
                className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                onClick={onNewClient}>
                Crea Cliente
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                onClick={onNewProject}>
                Crea Progetto
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                onClick={onNewTimeEntry}>
                Registra Lavoro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <ColorWidget />
          <DocsDialog />
          <Button
            variant="outline"
            size="icon"
            asChild
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Link to="/user">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
