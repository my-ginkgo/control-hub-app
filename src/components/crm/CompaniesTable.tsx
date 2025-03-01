
import { useState, useEffect } from 'react';
import { Company } from '@/types/Company';
import { supabase } from '@/integrations/supabase/client';
import { EditableCell } from './EditableCell';
import { toast } from 'sonner';
import { Building, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompaniesTableProps {
  onEdit: (company: Company) => void;
}

export const CompaniesTable = ({ onEdit }: CompaniesTableProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error(`Error loading companies: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyField = async (company: Company, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ [field]: value })
        .eq('id', company.id);
      
      if (error) throw error;
      
      setCompanies(companies.map(c => 
        c.id === company.id ? { ...c, [field]: value } : c
      ));
      toast.success('Company updated');
    } catch (error: any) {
      toast.error(`Error updating company: ${error.message}`);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      // First check if there are any leads associated with this company
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('company_id', id)
        .limit(1);
      
      if (leadError) throw leadError;
      
      if (leadData && leadData.length > 0) {
        return toast.error('Cannot delete company with associated leads. Please remove leads first.');
      }
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCompanies(companies.filter(c => c.id !== id));
      toast.success('Company deleted');
    } catch (error: any) {
      toast.error(`Error deleting company: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading companies...</div>;
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Industry</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Website</th>
              <th className="px-4 py-3 text-left font-medium">City</th>
              <th className="px-4 py-3 text-left font-medium">Country</th>
              <th className="px-4 py-3 text-right font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                  No companies found. Add your first company to get started.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.name}
                      row={company}
                      column="name"
                      onUpdate={updateCompanyField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.industry || ''}
                      row={company}
                      column="industry"
                      onUpdate={updateCompanyField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.phone || ''}
                      row={company}
                      column="phone"
                      onUpdate={updateCompanyField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.email || ''}
                      row={company}
                      column="email"
                      onUpdate={updateCompanyField}
                      type="text"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.website || ''}
                      row={company}
                      column="website"
                      onUpdate={updateCompanyField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.city || ''}
                      row={company}
                      column="city"
                      onUpdate={updateCompanyField}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <EditableCell
                      value={company.country || ''}
                      row={company}
                      column="country"
                      onUpdate={updateCompanyField}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(company)} 
                        title="Edit company"
                      >
                        <Building className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteCompany(company.id)} 
                        title="Delete company"
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
