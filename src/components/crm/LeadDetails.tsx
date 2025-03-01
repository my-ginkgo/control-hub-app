
import React from 'react';
import { Lead } from '@/types/Lead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EditableCell } from './EditableCell';
import { TagInput } from './TagInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeadDetailsProps {
  lead: Lead;
  companyOptions: string[];
  statusOptions: string[];
  sourceOptions: string[];
  communicationOptions: string[];
  allTags: string[];
  onTagsUpdated: (uniqueTags: string[]) => void;
}

export const LeadDetails = ({
  lead,
  companyOptions,
  statusOptions,
  sourceOptions,
  communicationOptions,
  allTags,
  onTagsUpdated
}: LeadDetailsProps) => {
  
  const updateLeadField = async (lead: Lead, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', lead.id);
      
      if (error) throw error;
      toast.success('Lead updated');
    } catch (error: any) {
      toast.error(`Error updating lead: ${error.message}`);
    }
  };

  const updateLeadTags = async (lead: Lead, tags: string[]) => {
    try {
      const tagsToSave = tags || [];
      
      const { error } = await supabase
        .from('leads')
        .update({ tags: tagsToSave })
        .eq('id', lead.id);
      
      if (error) throw error;
      
      // Update the all tags collection
      const uniqueTags = Array.from(
        new Set([
          ...allTags,
          ...tagsToSave
        ])
      );
      onTagsUpdated(uniqueTags);
      
      toast.success('Tags updated');
    } catch (error: any) {
      toast.error(`Error updating tags: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-muted/30">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="contact-info">
          <AccordionTrigger className="text-sm font-medium">
            Contact Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              <div>
                <p className="text-sm font-medium">Email</p>
                <EditableCell
                  value={lead.email || ''}
                  row={lead}
                  column="email"
                  onUpdate={updateLeadField}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <EditableCell
                  value={lead.phone || ''}
                  row={lead}
                  column="phone"
                  onUpdate={updateLeadField}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Communication Preference</p>
                <EditableCell
                  value={lead.communication_preference || ''}
                  row={lead}
                  column="communication_preference"
                  onUpdate={updateLeadField}
                  type="select"
                  options={communicationOptions}
                />
              </div>
              <div>
                <p className="text-sm font-medium">LinkedIn</p>
                <EditableCell
                  value={lead.linkedin_url || ''}
                  row={lead}
                  column="linkedin_url"
                  onUpdate={updateLeadField}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Twitter</p>
                <EditableCell
                  value={lead.twitter_url || ''}
                  row={lead}
                  column="twitter_url"
                  onUpdate={updateLeadField}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="lead-details">
          <AccordionTrigger className="text-sm font-medium">
            Lead Details
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <EditableCell
                  value={lead.status || 'new'}
                  row={lead}
                  column="status"
                  onUpdate={updateLeadField}
                  type="select"
                  options={statusOptions}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Source</p>
                <EditableCell
                  value={lead.source || ''}
                  row={lead}
                  column="source"
                  onUpdate={updateLeadField}
                  type="select"
                  options={sourceOptions}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Lead Score</p>
                <EditableCell
                  value={lead.lead_score?.toString() || ''}
                  row={lead}
                  column="lead_score"
                  onUpdate={(lead, column, value) => 
                    updateLeadField(lead, column, value ? parseInt(value) : null)
                  }
                  type="number"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Company</p>
                <EditableCell
                  value={lead.company_name || ''}
                  row={lead}
                  column="company_name"
                  onUpdate={(lead, column, value) => {
                    updateLeadField(lead, column, value);
                  }}
                  type="select"
                  options={companyOptions}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Last Contact</p>
                <EditableCell
                  value={lead.last_contact_date || ''}
                  row={lead}
                  column="last_contact_date"
                  onUpdate={updateLeadField}
                  type="date"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Tags</p>
                <TagInput 
                  tags={lead.tags || []} 
                  onChange={(tags) => updateLeadTags(lead, tags)}
                  placeholder="Aggiungi tag..."
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="opportunity-details">
          <AccordionTrigger className="text-sm font-medium">
            Opportunity Details
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-sm font-medium">Budget</p>
                <EditableCell
                  value={lead.budget || ''}
                  row={lead}
                  column="budget"
                  onUpdate={updateLeadField}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Decision Timeline</p>
                <EditableCell
                  value={lead.decision_timeline || ''}
                  row={lead}
                  column="decision_timeline"
                  onUpdate={updateLeadField}
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Interests</p>
                <EditableCell
                  value={lead.interests || ''}
                  row={lead}
                  column="interests"
                  onUpdate={updateLeadField}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="notes">
          <AccordionTrigger className="text-sm font-medium">
            Notes
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-2">
              <EditableCell
                value={lead.notes || ''}
                row={lead}
                column="notes"
                onUpdate={updateLeadField}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
