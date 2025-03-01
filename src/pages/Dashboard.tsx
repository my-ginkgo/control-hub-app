
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <div className="flex-1 relative">
          <MainLayout
            onNewClient={() => {}}
            onNewProject={() => {}}
            onNewTimeEntry={() => {}}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-muted-foreground">
                Seleziona un modulo per iniziare a lavorare
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Time Tracking Module Card */}
              <Card className="glass overflow-hidden border-primary/20 hover:border-primary/40 transition-all group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0"></div>
                <CardHeader className="relative z-10 border-b border-primary/10">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5 text-primary" />
                    Time Tracking
                  </CardTitle>
                  <CardDescription>
                    Traccia il tempo per i tuoi progetti, analizza la produttività e gestisci il lavoro dei clienti.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Gestisci clienti e progetti</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Registra ore fatturabili e non</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Genera report e analisi temporali</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button asChild className="w-full group-hover:shadow-md transition-all duration-300">
                    <Link to="/tracking" className="flex items-center justify-center gap-2">
                      Vai al Time Tracking
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* CRM Module Card */}
              <Card className="glass overflow-hidden border-secondary/20 hover:border-secondary/40 transition-all group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-secondary/10 z-0"></div>
                <CardHeader className="relative z-10 border-b border-secondary/10">
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    CRM
                  </CardTitle>
                  <CardDescription>
                    Gestisci leads e relazioni con i clienti in un unico posto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <span>Traccia leads e opportunità</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <span>Gestisci informazioni aziendali</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <span>Monitora stati e conversioni dei lead</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button asChild variant="secondary" className="w-full group-hover:shadow-md transition-all duration-300">
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
