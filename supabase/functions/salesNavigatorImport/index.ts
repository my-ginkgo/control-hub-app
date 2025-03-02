
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SalesNavigatorLead {
  uniqueLeadId: string;
  firstName: string;
  lastName: string;
  profileUrl?: string;
  basicProfileUrl?: string;
  occupation?: string;
  currentCompany?: string;
  phone?: string;
  country?: string;
  website?: string;
  twitter?: string;
  _status?: string;
  leadTags?: string;
  businessEmail?: string;
  email?: string;
  lastStepExecution?: string;
  leadConversation?: string;
  isConnectionAcceptedDetected?: string;
  campaignName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      // Parse the request as JSON
      const { leads, userId } = await req.json();

      if (!Array.isArray(leads) || !userId) {
        return new Response(
          JSON.stringify({ error: 'Invalid request: leads array and userId are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`Processing ${leads.length} leads for user ${userId}`);

      const results = [];
      const companyNames = new Set<string>();

      // First pass - collect all company names
      for (const lead of leads) {
        if (lead.currentCompany) {
          companyNames.add(lead.currentCompany);
        }
      }

      // Fetch existing companies
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select('id, name')
        .in('name', Array.from(companyNames))
        .eq('user_id', userId);

      // Create map of company names to IDs
      const companyMap: Record<string, string> = {};
      if (existingCompanies) {
        for (const company of existingCompanies) {
          companyMap[company.name] = company.id;
        }
      }

      // Process leads
      for (const lead of leads as SalesNavigatorLead[]) {
        try {
          // Skip if missing required fields
          if (!lead.firstName || !lead.lastName || !lead.uniqueLeadId) {
            results.push({
              uniqueLeadId: lead.uniqueLeadId || 'Unknown',
              status: 'error',
              message: 'Missing required fields'
            });
            continue;
          }

          // Get or create company if needed
          let companyId = null;
          if (lead.currentCompany) {
            if (!companyMap[lead.currentCompany]) {
              // Create new company
              const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert({
                  name: lead.currentCompany,
                  user_id: userId,
                  // Optionally add website if available
                  website: lead.website || null
                })
                .select('id')
                .single();

              if (companyError) {
                console.error('Error creating company:', companyError);
              } else if (newCompany) {
                companyMap[lead.currentCompany] = newCompany.id;
                companyId = newCompany.id;
              }
            } else {
              companyId = companyMap[lead.currentCompany];
            }
          }

          // Map lead status
          let status = 'new';
          if (lead._status) {
            if (lead._status.toLowerCase() === 'accepted') {
              status = 'contacted';
            } else if (lead._status.toLowerCase().includes('qualified')) {
              status = 'qualified';
            }
          }

          // Parse tags
          const tags = lead.leadTags ? 
            lead.leadTags.split(',').map(tag => tag.trim()).filter(Boolean) : 
            [];

          // Set lead score based on interaction status
          const acceptedConnection = lead.isConnectionAcceptedDetected?.toLowerCase() === 'yes';
          const leadScore = acceptedConnection ? 70 : 30;

          // Format notes with campaign and interaction info
          let notes = `LinkedIn ID: ${lead.uniqueLeadId}`;
          
          if (lead.campaignName) {
            notes += `\n\nCampaign: ${lead.campaignName}`;
          }
          
          if (lead.leadConversation) {
            notes += `\n\nConversation: ${lead.leadConversation}`;
          }

          // Check if lead exists (using uniqueLeadId in notes)
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('id')
            .like('notes', `%LinkedIn ID: ${lead.uniqueLeadId}%`)
            .eq('user_id', userId);

          // Prepare lead data
          const leadData = {
            first_name: lead.firstName,
            last_name: lead.lastName,
            email: lead.businessEmail || lead.email || null,
            phone: lead.phone || null,
            job_title: lead.occupation || null,
            linkedin_url: lead.profileUrl || lead.basicProfileUrl || null,
            twitter_url: lead.twitter || null,
            status,
            source: 'linkedin',
            notes,
            company_id: companyId,
            tags,
            lead_score: leadScore,
            communication_preference: 'in-person',
            user_id: userId
          };

          let result;
          if (existingLeads && existingLeads.length > 0) {
            // Update existing lead
            const { error } = await supabase
              .from('leads')
              .update(leadData)
              .eq('id', existingLeads[0].id);

            if (error) throw error;

            result = {
              uniqueLeadId: lead.uniqueLeadId,
              name: `${lead.firstName} ${lead.lastName}`,
              status: 'updated',
              message: 'Lead updated successfully'
            };
          } else {
            // Insert new lead
            const { error } = await supabase
              .from('leads')
              .insert(leadData);

            if (error) throw error;

            result = {
              uniqueLeadId: lead.uniqueLeadId,
              name: `${lead.firstName} ${lead.lastName}`,
              status: 'created',
              message: 'Lead created successfully'
            };
          }

          results.push(result);
        } catch (error) {
          console.error('Error processing lead:', error);
          results.push({
            uniqueLeadId: lead.uniqueLeadId || 'Unknown',
            name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown',
            status: 'error',
            message: error.message
          });
        }
      }

      const created = results.filter(r => r.status === 'created').length;
      const updated = results.filter(r => r.status === 'updated').length;
      const failed = results.filter(r => r.status === 'error').length;

      return new Response(
        JSON.stringify({
          message: `Processed ${results.length} leads: ${created} created, ${updated} updated, ${failed} failed`,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
