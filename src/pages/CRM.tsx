
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompaniesTable } from '@/components/crm/CompaniesTable';
import { LeadsTable } from '@/components/crm/LeadsTable';
import { LeadForm } from '@/components/crm/LeadForm';
import { CompanyForm } from '@/components/crm/CompanyForm';
import { DataImportExport } from '@/components/crm/DataImportExport';
import { LinkedInImport } from '@/components/crm/LinkedInImport';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, FileSpreadsheet, Linkedin, Plus, Users } from 'lucide-react';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';

const CRM = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
  // Add refresh counters to trigger table updates
  const [leadsRefreshCounter, setLeadsRefreshCounter] = useState(0);
  const [companiesRefreshCounter, setCompaniesRefreshCounter] = useState(0);
  
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
    // Increment counter to trigger refresh
    setLeadsRefreshCounter(prev => prev + 1);
  };
  
  const refreshCompanies = () => {
    // Increment counter to trigger refresh
    setCompaniesRefreshCounter(prev => prev + 1);
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#141414] text-white">
        <div className="flex-1 relative">
          <MainLayout
            onNewClient={() => {}}
            onNewProject={() => {}}
            onNewTimeEntry={() => {}}>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-red-600">CRM Dashboard</h1>
              <p className="text-gray-400">
                Gestisci i tuoi lead e le relazioni con le aziende
              </p>
            </div>
            
            <Tabs
              defaultValue="leads"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-[#333333] text-gray-400">
                  <TabsTrigger 
                    value="leads" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#E50914] data-[state=active]:text-white"
                  >
                    <Users className="h-4 w-4" />
                    Lead
                  </TabsTrigger>
                  <TabsTrigger 
                    value="companies" 
                    className="flex items-center gap-2 data-[state=active]:bg-[#E50914] data-[state=active]:text-white"
                  >
                    <Building className="h-4 w-4" />
                    Aziende
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-2">
                  {activeTab === 'leads' && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        document.getElementById('linkedin-import-trigger')?.click();
                      }}
                      className="bg-[#333333] border-none hover:bg-[#4d4d4d]"
                      title="Import from LinkedIn Sales Navigator"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const type = activeTab === 'leads' ? 'leads' : 'companies';
                      document.getElementById(`import-export-trigger-${type}`)?.click();
                    }}
                    className="bg-[#333333] border-none hover:bg-[#4d4d4d]"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    onClick={activeTab === 'leads' ? handleAddLead : handleAddCompany} 
                    className="bg-[#E50914] hover:bg-[#b2070f]"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <TabsContent value="leads" className="animate-fadeIn">
                <LeadsTable onEdit={handleEditLead} refresh={leadsRefreshCounter} />
                <LeadForm 
                  open={isLeadFormOpen} 
                  onOpenChange={handleLeadFormChange} 
                  lead={selectedLead} 
                  onLeadAdded={refreshLeads} 
                />
                <DataImportExport 
                  type="leads" 
                  onDataImported={refreshLeads}
                  triggerId="import-export-trigger-leads"
                />
                <LinkedInImport 
                  onLeadsImported={refreshLeads}
                  triggerId="linkedin-import-trigger"
                />
              </TabsContent>
              
              <TabsContent value="companies" className="animate-fadeIn">
                <CompaniesTable onEdit={handleEditCompany} refresh={companiesRefreshCounter} />
                <CompanyForm 
                  open={isCompanyFormOpen} 
                  onOpenChange={handleCompanyFormChange} 
                  company={selectedCompany} 
                  onCompanyAdded={refreshCompanies} 
                />
                <DataImportExport 
                  type="companies" 
                  onDataImported={refreshCompanies}
                  triggerId="import-export-trigger-companies"
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
