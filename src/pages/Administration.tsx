
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar/context";
import { Building, Briefcase, Clock, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Administration() {
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
          <h1 className="text-2xl font-bold mb-6">Amministrazione</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/">
              <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white hover:bg-[#22232e] transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-blue-500" />
                    Time Tracking
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Registra e monitora le ore di lavoro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Gestisci il tempo dedicato ai progetti, visualizza report e analisi delle ore lavorate.
                  </p>
                </CardContent>
                <CardFooter className="border-t border-[#2a2b3d] pt-3">
                  <div className="text-sm text-gray-400">Accedi al modulo</div>
                </CardFooter>
              </Card>
            </Link>

            <Link to="/administration/projects">
              <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white hover:bg-[#22232e] transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-6 w-6 mr-2 text-red-500" />
                    Progetti
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Gestisci tutti i progetti
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Crea, modifica e monitora i progetti, assegna risorse e visualizza le metriche di performance.
                  </p>
                </CardContent>
                <CardFooter className="border-t border-[#2a2b3d] pt-3">
                  <div className="text-sm text-gray-400">Accedi al modulo</div>
                </CardFooter>
              </Card>
            </Link>

            <Link to="/administration/clients">
              <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white hover:bg-[#22232e] transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-6 w-6 mr-2 text-green-500" />
                    Clienti
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Gestisci l'anagrafica clienti
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Crea e modifica i profili dei clienti, visualizza i progetti associati e le ore fatturate.
                  </p>
                </CardContent>
                <CardFooter className="border-t border-[#2a2b3d] pt-3">
                  <div className="text-sm text-gray-400">Accedi al modulo</div>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </div>
      </MainLayout>
    </SidebarProvider>
  );
}
