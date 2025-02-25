
import { useState } from "react";
import { Plus, Globe, Lock, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProjectSidebarProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onSelectProject?: (project: Project) => void;
  selectedProject?: Project;
}

export function ProjectSidebar({ 
  projects, 
  onAddProject, 
  onSelectProject,
  selectedProject 
}: ProjectSidebarProps) {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { role } = useRole();
  const { session } = useAuth();

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
    isPublic: false,
    clientId: "",
  });

  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
    isPublic: false,
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchClients();
    }
  }, [session?.user?.id]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Error fetching clients: " + error.message);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("clients")
        .insert({
          name: newClient.name,
          description: newClient.description,
          color: newClient.color,
          is_public: newClient.isPublic,
          user_id: session?.user?.id,
        });

      if (error) throw error;
      
      fetchClients();
      setNewClient({ name: "", description: "", color: "#4F46E5", isPublic: false });
      setIsClientDialogOpen(false);
      toast.success("Cliente aggiunto con successo!");
    } catch (error: any) {
      toast.error("Error adding client: " + error.message);
    }
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject({
      name: newProject.name,
      description: newProject.description,
      color: newProject.color,
      is_public: newProject.isPublic,
      client_id: newProject.clientId || undefined,
    });
    setNewProject({ name: "", description: "", color: "#4F46E5", isPublic: false, clientId: "" });
    setIsProjectDialogOpen(false);
  };

  const toggleProjectExpand = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedProjects((prev) =>
      prev.includes(project.id)
        ? prev.filter((id) => id !== project.id)
        : [...prev, project.id]
    );
  };

  const toggleClientExpand = (client: Client, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedClients((prev) =>
      prev.includes(client.id)
        ? prev.filter((id) => id !== client.id)
        : [...prev, client.id]
    );
  };

  const isCurrentUserProject = (project: Project) => {
    return project.user_id === session?.user?.id;
  };

  const isCurrentUserClient = (client: Client) => {
    return client.user_id === session?.user?.id;
  };

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader className="p-4 flex justify-between items-center">
            <SidebarGroupLabel className="text-lg font-semibold text-purple-400">Clienti</SidebarGroupLabel>
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/20 border-0 hover:bg-black/40"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
                <DialogHeader>
                  <DialogTitle className="text-white">Nuovo Cliente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div>
                    <Label htmlFor="client-name" className="text-gray-400">Nome</Label>
                    <Input
                      id="client-name"
                      value={newClient.name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, name: e.target.value })
                      }
                      className="bg-[#2a2b3d] border-[#383a5c] text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-description" className="text-gray-400">Descrizione</Label>
                    <Textarea
                      id="client-description"
                      value={newClient.description}
                      onChange={(e) =>
                        setNewClient({ ...newClient, description: e.target.value })
                      }
                      className="bg-[#2a2b3d] border-[#383a5c] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-color" className="text-gray-400">Colore (opzionale)</Label>
                    <Input
                      id="client-color"
                      type="color"
                      value={newClient.color}
                      onChange={(e) =>
                        setNewClient({ ...newClient, color: e.target.value })
                      }
                      className="bg-[#2a2b3d] border-[#383a5c] h-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="client-is-public"
                      checked={newClient.isPublic}
                      onCheckedChange={(checked) =>
                        setNewClient({ ...newClient, isPublic: checked })
                      }
                    />
                    <Label htmlFor="client-is-public" className="text-gray-400">Cliente pubblico</Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Aggiungi Cliente
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </SidebarHeader>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "group rounded-lg transition-all duration-200",
                    "hover:bg-black/20",
                    !client.is_public && isCurrentUserClient(client) && role === "ADMIN" && "bg-purple-500/10 hover:bg-purple-500/20"
                  )}
                >
                  <div
                    className="p-3 cursor-pointer"
                    style={{
                      borderLeft: `4px solid ${client.color || "#4F46E5"}`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <h3 className={cn(
                          "font-medium",
                          !client.is_public && isCurrentUserClient(client) && role === "ADMIN" 
                            ? "text-purple-400" 
                            : "text-gray-200"
                        )}>
                          {client.name}
                        </h3>
                        {client.is_public ? (
                          <Globe className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Lock className={cn(
                            "h-4 w-4",
                            isCurrentUserClient(client) && role === "ADMIN" 
                              ? "text-purple-400" 
                              : "text-gray-400"
                          )} />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={(e) => toggleClientExpand(client, e)}
                      >
                        {expandedClients.includes(client.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "text-sm text-gray-400 overflow-hidden transition-all duration-200",
                        expandedClients.includes(client.id)
                          ? "max-h-24 mt-2"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      {client.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarHeader className="p-4 flex justify-between items-center">
            <SidebarGroupLabel className="text-lg font-semibold text-purple-400">Progetti</SidebarGroupLabel>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/20 border-0 hover:bg-black/40"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
                <DialogHeader>
                  <DialogTitle className="text-white">Nuovo Progetto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-400">Nome</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      className="bg-[#2a2b3d] border-[#383a5c] text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-gray-400">Descrizione</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({ ...newProject, description: e.target.value })
                      }
                      className="bg-[#2a2b3d] border-[#383a5c] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client" className="text-gray-400">Cliente</Label>
                    <select
                      id="client"
                      value={newProject.clientId}
                      onChange={(e) =>
                        setNewProject({ ...newProject, clientId: e.target.value })
                      }
                      className="w-full bg-[#2a2b3d] border-[#383a5c] text-white rounded-md p-2"
                    >
                      <option value="">Seleziona un cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="color" className="text-gray-400">Colore (opzionale)</Label>
                    <Input
                      id="color"
                      type="color"
                      value={newProject.color}
                      onChange={(e) =>
                        setNewProject({ ...newProject, color: e.target.value })
                      }
                      className="bg-[#2a2b3d] border-[#383a5c] h-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-public"
                      checked={newProject.isPublic}
                      onCheckedChange={(checked) =>
                        setNewProject({ ...newProject, isPublic: checked })
                      }
                    />
                    <Label htmlFor="is-public" className="text-gray-400">Progetto pubblico</Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Aggiungi Progetto
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </SidebarHeader>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={cn(
                    "group rounded-lg transition-all duration-200",
                    "hover:bg-black/20",
                    !project.is_public && isCurrentUserProject(project) && role === "ADMIN" && "bg-purple-500/10 hover:bg-purple-500/20",
                    selectedProject?.id === project.id && "bg-purple-500/20"
                  )}
                >
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                    style={{
                      borderLeft: `4px solid ${project.color || "#4F46E5"}`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-medium",
                          !project.is_public && isCurrentUserProject(project) && role === "ADMIN" 
                            ? "text-purple-400" 
                            : "text-gray-200"
                        )}>
                          {project.name}
                        </h3>
                        {project.is_public ? (
                          <Globe className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Lock className={cn(
                            "h-4 w-4",
                            isCurrentUserProject(project) && role === "ADMIN" 
                              ? "text-purple-400" 
                              : "text-gray-400"
                          )} />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={(e) => toggleProjectExpand(project, e)}
                      >
                        {expandedProjects.includes(project.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "text-sm text-gray-400 overflow-hidden transition-all duration-200",
                        expandedProjects.includes(project.id)
                          ? "max-h-24 mt-2"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      {project.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
