
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#141414] text-white">
        <div className="flex-1 relative">
          <MainLayout
            onNewClient={() => {}}
            onNewProject={() => {}}
            onNewTimeEntry={() => {}}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-red-600">Dashboard</h1>
              <p className="text-gray-400">
                Seleziona un modulo per iniziare a lavorare
              </p>
            </div>
            
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
                      <span>Gestisci clienti e progetti</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <span>Registra ore fatturabili e non</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <span>Genera report e analisi temporali</span>
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
          </MainLayout>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
