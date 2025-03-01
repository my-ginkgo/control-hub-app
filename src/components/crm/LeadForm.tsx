
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/Lead';
import { Company } from '@/types/Company';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  onLeadAdded: () => void;
}

const STATUS_OPTIONS = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost'
];

const SOURCE_OPTIONS = [
  'website',
  'referral',
  'social media',
  'event',
  'cold call',
  'email campaign',
  'other'
];

export const LeadForm = ({ open, onOpenChange, lead, onLeadAdded }: LeadFormProps) => {
  const [firstName, setFirstName] = useState(lead?.first_name || '');
  const [lastName, setLastName] = useState(lead?.last_name || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [jobTitle, setJobTitle] = useState(lead?.job_title || '');
  const [status, setStatus] = useState(lead?.status || 'new');
  const [source, setSource] = useState(lead?.source || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [companyId, setCompanyId] = useState(lead?.company_id || '');
  const [lastContactDate, setLastContactDate] = useState(lead?.last_contact_date?.split('T')[0] || '');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      toast.error(`Error fetching companies: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        job_title: jobTitle,
        status,
        source,
        notes,
        company_id: companyId || null,
        last_contact_date: lastContactDate || null
      };

      if (lead?.id) {
        // Update existing lead
        const { error } = await supabase
          .from('leads')
          .update(formData)
          .eq('id', lead.id);

        if (error) throw error;
        toast.success('Lead updated successfully');
      } else {
        // Add new lead
        const { error } = await supabase
          .from('leads')
          .insert([formData]);

        if (error) throw error;
        toast.success('Lead added successfully');
      }

      onLeadAdded();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setJobTitle('');
    setStatus('new');
    setSource('');
    setNotes('');
    setCompanyId('');
    setLastContactDate('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lead?.id ? 'Edit Lead' : 'Add Lead'}</SheetTitle>
          <SheetDescription>
            Fill in the lead details below.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
              />
            </div>
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
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input 
              id="jobTitle" 
              value={jobTitle} 
              onChange={(e) => setJobTitle(e.target.value)} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Company</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastContactDate">Last Contact Date</Label>
            <Input 
              id="lastContactDate" 
              value={lastContactDate} 
              onChange={(e) => setLastContactDate(e.target.value)} 
              type="date" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : lead?.id ? 'Update Lead' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
