
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Company } from '@/types/Company';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onCompanyAdded: () => void;
}

export const CompanyForm = ({ open, onOpenChange, company, onCompanyAdded }: CompanyFormProps) => {
  const [name, setName] = useState(company?.name || '');
  const [description, setDescription] = useState(company?.description || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [industry, setIndustry] = useState(company?.industry || '');
  const [employeeCount, setEmployeeCount] = useState(company?.employee_count?.toString() || '');
  const [annualRevenue, setAnnualRevenue] = useState(company?.annual_revenue || '');
  const [foundedDate, setFoundedDate] = useState(company?.founded_date?.split('T')[0] || '');
  const [address, setAddress] = useState(company?.address || '');
  const [city, setCity] = useState(company?.city || '');
  const [country, setCountry] = useState(company?.country || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [email, setEmail] = useState(company?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        name,
        description,
        website,
        industry,
        employee_count: employeeCount ? parseInt(employeeCount) : null,
        annual_revenue: annualRevenue,
        founded_date: foundedDate || null,
        address,
        city,
        country,
        phone,
        email,
      };

      if (company?.id) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', company.id);

        if (error) throw error;
        toast.success('Company updated successfully');
      } else {
        // Add new company
        const { error } = await supabase
          .from('companies')
          .insert([formData]);

        if (error) throw error;
        toast.success('Company added successfully');
      }

      onCompanyAdded();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setWebsite('');
    setIndustry('');
    setEmployeeCount('');
    setAnnualRevenue('');
    setFoundedDate('');
    setAddress('');
    setCity('');
    setCountry('');
    setPhone('');
    setEmail('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{company?.id ? 'Edit Company' : 'Add Company'}</SheetTitle>
          <SheetDescription>
            Fill in the company details below.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)} 
                type="url"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                value={industry} 
                onChange={(e) => setIndustry(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employee Count</Label>
              <Input 
                id="employeeCount" 
                value={employeeCount} 
                onChange={(e) => setEmployeeCount(e.target.value)} 
                type="number" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Annual Revenue</Label>
              <Input 
                id="annualRevenue" 
                value={annualRevenue} 
                onChange={(e) => setAnnualRevenue(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="foundedDate">Founded Date</Label>
            <Input 
              id="foundedDate" 
              value={foundedDate} 
              onChange={(e) => setFoundedDate(e.target.value)} 
              type="date" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                type="tel" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : company?.id ? 'Update Company' : 'Add Company'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
