
import { SidebarProvider } from '@/components/ui/sidebar/context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, ArrowRight, Briefcase, Building, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { RecentTimeEntries } from '@/components/time-entry/RecentTimeEntries';
import { toast } from 'sonner';
import { TimeEntryData } from '@/components/TimeEntry';

const Dashboard = () => {
  const { session } = useAuth();
  const [recentTimeEntries, setRecentTimeEntries] = useState<TimeEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchRecentTimeEntries();
    }
  }, [session]);

  const fetchRecentTimeEntries = async () => {
    try {
      setIsLoading(true);
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
        .limit(5);

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
        setRecentTimeEntries(formattedEntries);
      }
    } catch (error: any) {
      console.error("Error fetching time entries:", error.message);
      toast.error("Error fetching time entries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTimeEntry = () => {
    // Redirect to time tracking page
    window.location.href = "/tracking";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#141414] text-white">
        <div className="flex-1 relative">
          <MainLayout
            onNewClient={() => {}}
            onNewProject={() => {}}
            onNewTimeEntry={() => {}}>
            <div className="container mx-auto px-4 py-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-red-600">Dashboard</h1>
                <p className="text-gray-400">
                  Seleziona un modulo per iniziare a lavorare
                </p>
              </div>
              
              {/* Recent Time Entries Section */}
              {!isLoading && recentTimeEntries.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Ultime Registrazioni</h2>
                    <Button 
                      onClick={handleAddTimeEntry}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Aggiungi Ore
                    </Button>
                  </div>
                  <RecentTimeEntries 
                    timeEntries={recentTimeEntries} 
                    onAddTimeEntry={handleAddTimeEntry} 
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Time Tracking Module Card */}
                <Card className="overflow-hidden border-0 bg-[#1E1E1E] hover:bg-[#333333] transition-all group">
                  <CardHeader className="relative z-10 border-b border-gray-800">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Clock className="h-5 w-5 text-red-600" />
                      Time Tracking
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Traccia il tempo per i tuoi progetti, analizza la produttività e gestisci il lavoro dei clienti.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 text-gray-300">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span>Registra ore fatturabili e non</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span>Assegna ore a progetti specifici</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span>Visualizza report dettagliati</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 group-hover:shadow-lg transition-all duration-300">
                      <Link to="/tracking" className="flex items-center justify-center gap-2">
                        Vai al Time Tracking
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* CRM Module Card */}
                <Card className="overflow-hidden border-0 bg-[#1E1E1E] hover:bg-[#333333] transition-all group">
                  <CardHeader className="relative z-10 border-b border-gray-800">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <BarChart3 className="h-5 w-5 text-red-600" />
                      CRM
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestisci leads e relazioni con i clienti in un unico posto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 text-gray-300">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span>Traccia leads e opportunità</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span>Gestisci informazioni aziendali</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span>Monitora stati e conversioni dei lead</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 group-hover:shadow-lg transition-all duration-300">
                      <Link to="/crm" className="flex items-center justify-center gap-2">
                        Vai al CRM
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Administration Section */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Amministrazione</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Projects Card */}
                  <Card className="overflow-hidden border-0 bg-[#1E1E1E] hover:bg-[#333333] transition-all group">
                    <CardHeader className="relative z-10 border-b border-gray-800 pb-3">
                      <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                        <Briefcase className="h-4 w-4 text-red-600" />
                        Progetti
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-3 text-gray-300 text-sm">
                      <p>Gestisci tutti i progetti dell'azienda</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button asChild variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-400 hover:bg-transparent p-0">
                        <Link to="/administration/projects" className="flex items-center justify-center gap-1">
                          Visualizza Progetti
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Clients Card */}
                  <Card className="overflow-hidden border-0 bg-[#1E1E1E] hover:bg-[#333333] transition-all group">
                    <CardHeader className="relative z-10 border-b border-gray-800 pb-3">
                      <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                        <Building className="h-4 w-4 text-red-600" />
                        Clienti
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-3 text-gray-300 text-sm">
                      <p>Visualizza e gestisci i clienti</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button asChild variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-400 hover:bg-transparent p-0">
                        <Link to="/administration/clients" className="flex items-center justify-center gap-1">
                          Visualizza Clienti
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Calendar Card */}
                  <Card className="overflow-hidden border-0 bg-[#1E1E1E] hover:bg-[#333333] transition-all group">
                    <CardHeader className="relative z-10 border-b border-gray-800 pb-3">
                      <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                        <Calendar className="h-4 w-4 text-red-600" />
                        Calendario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 pb-3 text-gray-300 text-sm">
                      <p>Pianifica e visualizza le attività</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button asChild variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-400 hover:bg-transparent p-0">
                        <Link to="/calendar" className="flex items-center justify-center gap-1">
                          Vai al Calendario
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </MainLayout>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
