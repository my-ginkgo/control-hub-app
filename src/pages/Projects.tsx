
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Project } from "@/types/Project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Briefcase, Clock, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar/context";
import { TimeTable } from "@/components/TimeTable";
import { ProjectTimeChart } from "@/components/ProjectTimeChart";
import { TimeEntryData } from "@/components/TimeEntry";
import { format, endOfMonth, startOfMonth } from "date-fns";

export default function Projects() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [startDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate] = useState<Date>(endOfMonth(new Date()));

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchTimeEntries();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .order("name");

      if (error) throw error;
      
      if (data) {
        setProjects(data);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
      toast.error("Error fetching projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          id,
          hours,
          billable_hours,
          notes,
          date,
          start_date,
          end_date,
          assigned_user_id,
          user_id,
          projects(name)
        `)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedEntries = data.map((entry) => ({
          id: entry.id,
          hours: Number(entry.hours),
          billableHours: Number(entry.billable_hours),
          notes: entry.notes,
          date: entry.date,
          project: entry.projects?.name || "Unknown Project",
          startDate: entry.start_date,
          endDate: entry.end_date,
          assignedUserId: entry.assigned_user_id,
          userId: entry.user_id,
        }));
        setTimeEntries(formattedEntries);
      }
    } catch (error: any) {
      console.error("Error fetching time entries:", error.message);
      toast.error("Error fetching time entries");
    }
  };

  const handleNewClient = () => {
    toast.info("Create new client feature will be implemented soon");
  };

  const handleNewProject = () => {
    toast.info("Create new project feature will be implemented soon");
  };

  const handleNewTimeEntry = () => {
    toast.info("Usa la pagina di Time Tracking per registrare lavoro");
  };

  return (
    <SidebarProvider>
      <MainLayout 
        onNewClient={handleNewClient}
        onNewProject={handleNewProject}
        onNewTimeEntry={handleNewTimeEntry}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Progetti</h1>
            <Button 
              onClick={handleNewProject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Progetto
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-[#1a1b26] border-[#2a2b3d] text-white h-48 animate-pulse">
                  <CardContent className="p-6"></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {projects.length === 0 ? (
                <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <Briefcase className="h-16 w-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nessun progetto</h3>
                    <p className="text-gray-400 mb-4 text-center">
                      Non hai ancora creato nessun progetto. Inizia creando il tuo primo progetto.
                    </p>
                    <Button 
                      onClick={handleNewProject}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crea Progetto
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <Link key={project.id} to={`/project/${project.id}`}>
                        <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white hover:bg-[#22232e] transition-colors cursor-pointer h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center text-red-600">
                              <Briefcase className="h-5 w-5 mr-2" />
                              {project.name}
                            </CardTitle>
                            {project.clients && (
                              <CardDescription className="text-gray-400">
                                Cliente: {(project.clients as any).name || "Nessun cliente"}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 line-clamp-2">
                              {project.description || "Nessuna descrizione"}
                            </p>
                          </CardContent>
                          <CardFooter className="border-t border-[#2a2b3d] pt-3">
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              Visualizza dettagli
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  <Separator className="my-8 bg-gray-800" />
                  
                  <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white">
                    <CardHeader>
                      <CardTitle>Ultime Registrazioni</CardTitle>
                      <div className="text-sm text-gray-400">
                        {format(startDate, "PP")} - {format(endDate, "PP")}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <TimeTable 
                        entries={timeEntries} 
                        onEntryDeleted={fetchTimeEntries}
                        start={startDate}
                        end={endDate}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </MainLayout>
    </SidebarProvider>
  );
}
