
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Plus, Sun, User, Clock, BarChart3, Home, Layers, Briefcase, Building, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "../ui/sidebar";
import { useTheme } from "../ThemeProvider";
import { DocsDialog } from "../docs/DocsDialog";

interface MainLayoutProps {
  children: React.ReactNode;
  onNewClient: () => void;
  onNewProject: () => void;
  onNewTimeEntry: () => void;
}

export function MainLayout({ children, onNewClient, onNewProject, onNewTimeEntry }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isCrmPage = location.pathname === "/crm";

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="bg-popover hover:bg-muted text-popover-foreground" />
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="w-12 h-12" />
          </Link>
          
          <div className="hidden md:flex items-center gap-4 ml-4">
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Modules
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border">
                <DropdownMenuItem asChild className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <Link to="/administration">
                    <Settings className="h-4 w-4 mr-2" />
                    Amministrazione
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <Link to="/administration/projects">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Progetti
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <Link to="/administration/clients">
                    <Building className="h-4 w-4 mr-2" />
                    Clienti
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-popover-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <Link to="/crm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    CRM
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isCrmPage && (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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
