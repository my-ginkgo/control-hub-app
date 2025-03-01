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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
] as const;

type LeadStatus = typeof STATUS_OPTIONS[number];

const SOURCE_OPTIONS = [
  'website',
  'referral',
  'social media',
  'event',
  'cold call',
  'email campaign',
  'other'
];

const COMMUNICATION_OPTIONS = [
  'email',
  'phone',
  'in-person',
  'video'
];

export const LeadForm = ({ open, onOpenChange, lead, onLeadAdded }: LeadFormProps) => {
  const [firstName, setFirstName] = useState(lead?.first_name || '');
  const [lastName, setLastName] = useState(lead?.last_name || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [jobTitle, setJobTitle] = useState(lead?.job_title || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status as LeadStatus || 'new');
  const [source, setSource] = useState(lead?.source || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [companyId, setCompanyId] = useState(lead?.company_id || '');
  const [lastContactDate, setLastContactDate] = useState(lead?.last_contact_date?.split('T')[0] || '');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [linkedinUrl, setLinkedinUrl] = useState(lead?.linkedin_url || '');
  const [twitterUrl, setTwitterUrl] = useState(lead?.twitter_url || '');
  const [interests, setInterests] = useState(lead?.interests || '');
  const [budget, setBudget] = useState(lead?.budget || '');
  const [decisionTimeline, setDecisionTimeline] = useState(lead?.decision_timeline || '');
  const [communicationPreference, setCommunicationPreference] = useState(lead?.communication_preference || '');
  const [leadScore, setLeadScore] = useState(lead?.lead_score?.toString() || '');

  useEffect(() => {
    if (open) {
      fetchCompanies();
      
      if (lead) {
        setFirstName(lead.first_name || '');
        setLastName(lead.last_name || '');
        setEmail(lead.email || '');
        setPhone(lead.phone || '');
        setJobTitle(lead.job_title || '');
        setStatus((lead.status as LeadStatus) || 'new');
        setSource(lead.source || '');
        setNotes(lead.notes || '');
        setCompanyId(lead.company_id || '');
        setLastContactDate(lead.last_contact_date?.split('T')[0] || '');
        
        setLinkedinUrl(lead.linkedin_url || '');
        setTwitterUrl(lead.twitter_url || '');
        setInterests(lead.interests || '');
        setBudget(lead.budget || '');
        setDecisionTimeline(lead.decision_timeline || '');
        setCommunicationPreference(lead.communication_preference || '');
        setLeadScore(lead.lead_score?.toString() || '');
      }
    }
  }, [open, lead]);

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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

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
        last_contact_date: lastContactDate || null,
        linkedin_url: linkedinUrl,
        twitter_url: twitterUrl,
        interests,
        budget,
        decision_timeline: decisionTimeline,
        communication_preference: communicationPreference,
        lead_score: leadScore ? parseInt(leadScore) : null,
        user_id: userData.user.id
      };

      if (lead?.id) {
        const { error } = await supabase
          .from('leads')
          .update(formData)
          .eq('id', lead.id);

        if (error) throw error;
        toast.success('Lead updated successfully');
      } else {
        const { error } = await supabase
          .from('leads')
          .insert(formData);

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
    setLinkedinUrl('');
    setTwitterUrl('');
    setInterests('');
    setBudget('');
    setDecisionTimeline('');
    setCommunicationPreference('');
    setLeadScore('');
    setActiveTab('basic');
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
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
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input 
                  id="jobTitle" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Company</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={status} 
                    onValueChange={(value: LeadStatus) => setStatus(value)}
                  >
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
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
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
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input 
                  id="linkedin" 
                  value={linkedinUrl} 
                  onChange={(e) => setLinkedinUrl(e.target.value)} 
                  type="url" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input 
                  id="twitter" 
                  value={twitterUrl} 
                  onChange={(e) => setTwitterUrl(e.target.value)} 
                  type="url" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communicationPreference">Communication Preference</Label>
                <Select 
                  value={communicationPreference} 
                  onValueChange={setCommunicationPreference}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">No Preference</SelectItem>
                    {COMMUNICATION_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
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
                <Label htmlFor="leadScore">Lead Score (1-100)</Label>
                <Input 
                  id="leadScore" 
                  value={leadScore} 
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 0 || value > 100) {
                      return;
                    }
                    setLeadScore(e.target.value);
                  }} 
                  type="number"
                  min="0"
                  max="100" 
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
            </TabsContent>
            
            <TabsContent value="opportunity" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input 
                  id="budget" 
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decisionTimeline">Decision Timeline</Label>
                <Input 
                  id="decisionTimeline" 
                  value={decisionTimeline} 
                  onChange={(e) => setDecisionTimeline(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Textarea 
                  id="interests" 
                  value={interests} 
                  onChange={(e) => setInterests(e.target.value)} 
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
          
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
