
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompaniesTable } from '@/components/crm/CompaniesTable';
import { LeadsTable } from '@/components/crm/LeadsTable';
import { LeadForm } from '@/components/crm/LeadForm';
import { CompanyForm } from '@/components/crm/CompanyForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Plus, Users } from 'lucide-react';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';

const CRM = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
  
  const handleAddLead = () => {
    setSelectedLead(undefined);
    setIsLeadFormOpen(true);
  };
  
  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadFormOpen(true);
  };
  
  const handleAddCompany = () => {
    setSelectedCompany(undefined);
    setIsCompanyFormOpen(true);
  };
  
  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyFormOpen(true);
  };
  
  const handleLeadFormChange = (open: boolean) => {
    setIsLeadFormOpen(open);
    if (!open) setSelectedLead(undefined);
  };
  
  const handleCompanyFormChange = (open: boolean) => {
    setIsCompanyFormOpen(open);
    if (!open) setSelectedCompany(undefined);
  };
  
  const refreshLeads = () => {
    // This will trigger the LeadsTable to refresh its data
    setIsLeadFormOpen(false);
  };
  
  const refreshCompanies = () => {
    // This will trigger the CompaniesTable to refresh its data
    setIsCompanyFormOpen(false);
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1a1b26] text-white dark:bg-[#1a1b26] dark:text-white">
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
              <div className="flex justify-between items-center mb-6">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="leads" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Leads
                  </TabsTrigger>
                  <TabsTrigger value="companies" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Companies
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === 'leads' ? (
                  <Button onClick={handleAddLead} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                ) : (
                  <Button onClick={handleAddCompany} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Company
                  </Button>
                )}
              </div>
              
              <TabsContent value="leads" className="animate-fadeIn">
                <LeadsTable onEdit={handleEditLead} />
                <LeadForm 
                  open={isLeadFormOpen} 
                  onOpenChange={handleLeadFormChange} 
                  lead={selectedLead} 
                  onLeadAdded={refreshLeads} 
                />
              </TabsContent>
              
              <TabsContent value="companies" className="animate-fadeIn">
                <CompaniesTable onEdit={handleEditCompany} />
                <CompanyForm 
                  open={isCompanyFormOpen} 
                  onOpenChange={handleCompanyFormChange} 
                  company={selectedCompany} 
                  onCompanyAdded={refreshCompanies} 
                />
              </TabsContent>
            </Tabs>
          </MainLayout>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CRM;
