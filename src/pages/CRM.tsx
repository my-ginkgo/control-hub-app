
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompaniesTable } from '@/components/crm/CompaniesTable';
import { LeadsTable } from '@/components/crm/LeadsTable';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Building, Users } from 'lucide-react';

const CRM = () => {
  const [activeTab, setActiveTab] = useState('leads');
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1a1b26] text-white dark:bg-[#1a1b26] dark:text-white">
        <ProjectSidebar
          projects={[]}
          onSelectProject={() => {}}
          selectedProject={null}
          selectedClient={null}
          onSelectClient={() => {}}
          onProjectDeleted={() => {}}
          onProjectUpdated={() => {}}
          onAddProject={() => {}}
        />
        <div className="flex-1 relative">
          <MainLayout
            onNewClient={() => {}}
            onNewProject={() => {}}
            onNewTimeEntry={() => {}}>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your leads and company relationships
              </p>
            </div>
            
            <Tabs
              defaultValue="leads"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-[400px] grid-cols-2 mb-6">
                <TabsTrigger value="leads" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Leads
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Companies
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="leads" className="animate-fadeIn">
                <LeadsTable />
              </TabsContent>
              
              <TabsContent value="companies" className="animate-fadeIn">
                <CompaniesTable />
              </TabsContent>
            </Tabs>
          </MainLayout>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CRM;
