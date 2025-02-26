
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

interface MainLayoutProps {
  children: React.ReactNode;
  onNewClient: () => void;
  onNewProject: () => void;
  onNewTimeEntry: () => void;
}

export function MainLayout({ children, onNewClient, onNewProject, onNewTimeEntry }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 pl-[250px]">
        <div className="bg-[#1a1b26] border-b border-[#383a5c]">
          <div className="container py-4 md:py-4 px-4 md:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-[#2a2b3d] border-[#383a5c]" />
                <Link to="/">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12" />
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Crea
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-[#24253a] border-[#383a5c]">
                    <DropdownMenuItem
                      className="text-white focus:bg-[#383a5c] focus:text-white cursor-pointer"
                      onClick={onNewClient}>
                      Crea Cliente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white focus:bg-[#383a5c] focus:text-white cursor-pointer"
                      onClick={onNewProject}>
                      Crea Progetto
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white focus:bg-[#383a5c] focus:text-white cursor-pointer"
                      onClick={onNewTimeEntry}>
                      Registra Lavoro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <DocsDialog />
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
                  <Link to="/user">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 pt-[72px]">
        {children}
      </div>
    </div>
  );
}
