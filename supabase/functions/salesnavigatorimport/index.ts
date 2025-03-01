
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-userid',
}

interface ImportResult {
  lead: string;
  status: 'success' | 'error';
  message: string;
}

// Mock data for simulation
const mockLeads = [
  { 
    first_name: 'Marco', 
    last_name: 'Rossi', 
    job_title: 'Marketing Director', 
    company_name: 'Techno Solutions',
    linkedin_url: 'https://linkedin.com/in/marcorossi'
  },
  { 
    first_name: 'Laura', 
    last_name: 'Bianchi', 
    job_title: 'CTO', 
    company_name: 'Digital Innovations',
    linkedin_url: 'https://linkedin.com/in/laurabianchi'
  },
  { 
    first_name: 'Giuseppe', 
    last_name: 'Verdi', 
    job_title: 'Sales Manager', 
    company_name: 'Global Connect',
    linkedin_url: 'https://linkedin.com/in/giuseppeverdi'
  },
  { 
    first_name: 'Sofia', 
    last_name: 'Ferrari', 
    job_title: 'Product Owner', 
    company_name: 'Creative Labs',
    linkedin_url: 'https://linkedin.com/in/sofiaferrari'
  },
  { 
    first_name: 'Alessandro', 
    last_name: 'Romano', 
    job_title: 'CEO', 
    company_name: 'Startup Ventures',
    linkedin_url: 'https://linkedin.com/in/alessandroromano'
  }
];

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders
    });
  }

  try {
    console.log('Received request to sales navigator import function');
    
    // Get token and user ID from request
    const { linkedinToken } = await req.json();
    const userId = req.headers.get('x-userid');
    
    console.log('User ID from header:', userId);
    
    if (!linkedinToken) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn token is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log('Received import request with token:', linkedinToken.substring(0, 4) + '****');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Simulate API call to LinkedIn
    const results: ImportResult[] = [];
    const successRate = 0.8; // 80% success rate for simulation
    
    // Process mock leads
    for (const lead of mockLeads) {
      // Simulate some processing delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Random success/failure for simulation
      const isSuccess = Math.random() < successRate;
      
      if (isSuccess) {
        // First check if company exists
        let companyId = null;
        
        const { data: companyData, error: companyQueryError } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('name', lead.company_name)
          .maybeSingle();
        
        if (companyQueryError) {
          console.error('Error querying company:', companyQueryError);
          results.push({
            lead: `${lead.first_name} ${lead.last_name}`,
            status: 'error',
            message: `Company query failed: ${companyQueryError.message}`
          });
          continue;
        }
        
        if (companyData) {
          companyId = companyData.id;
          console.log('Found existing company:', lead.company_name, 'with ID:', companyId);
        } else {
          // Create company if it doesn't exist
          const { data: newCompany, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
              name: lead.company_name,
              industry: 'Technology',  // Default for mock data
              user_id: userId
            })
            .select('id')
            .single();
          
          if (companyError) {
            console.error('Error creating company:', companyError);
            results.push({
              lead: `${lead.first_name} ${lead.last_name}`,
              status: 'error',
              message: `Failed to create company: ${companyError.message}`
            });
            continue;
          }
          
          companyId = newCompany.id;
          console.log('Created new company:', lead.company_name, 'with ID:', companyId);
        }
        
        // Create the lead
        const { error: leadError } = await supabaseAdmin
          .from('leads')
          .insert({
            first_name: lead.first_name,
            last_name: lead.last_name,
            job_title: lead.job_title,
            company_id: companyId,
            source: 'linkedin',
            status: 'new',
            user_id: userId,
            linkedin_url: lead.linkedin_url
          });
        
        if (leadError) {
          console.error('Error creating lead:', leadError);
          results.push({
            lead: `${lead.first_name} ${lead.last_name}`,
            status: 'error',
            message: `Import failed: ${leadError.message}`
          });
        } else {
          console.log('Successfully imported lead:', `${lead.first_name} ${lead.last_name}`);
          results.push({
            lead: `${lead.first_name} ${lead.last_name}`,
            status: 'success',
            message: 'Successfully imported'
          });
        }
      } else {
        // Simulate failure for some leads
        console.log('Failed to import lead:', `${lead.first_name} ${lead.last_name}`);
        results.push({
          lead: `${lead.first_name} ${lead.last_name}`,
          status: 'error',
          message: 'Connection timed out or profile unavailable'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        imported: results,
        message: 'Import process completed'
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error in SalesNavigator import:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
