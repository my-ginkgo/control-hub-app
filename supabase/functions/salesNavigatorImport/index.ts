
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { linkedinToken } = await req.json()
    
    if (!linkedinToken) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // This is where you would implement the Sales Navigator API calls
    // Since LinkedIn doesn't provide a public API for Sales Navigator,
    // we'll simulate the response for now
    
    console.log("Attempting to import leads from Sales Navigator with token:", linkedinToken.substring(0, 10) + "...")
    
    // Simulated response - in a real implementation, you would call the LinkedIn API
    const mockLeads = [
      {
        first_name: "Marco",
        last_name: "Rossi",
        email: "marco.rossi@example.com",
        job_title: "Marketing Director",
        company_name: "TechCorp Italia",
        phone: "+3902123456789",
        linkedin_url: "https://www.linkedin.com/in/marcorossi/",
        source: "sales_navigator"
      },
      {
        first_name: "Giulia",
        last_name: "Bianchi",
        email: "giulia.bianchi@example.com",
        job_title: "CTO",
        company_name: "Innovare Srl",
        phone: "+3903987654321",
        linkedin_url: "https://www.linkedin.com/in/giuliabianchi/",
        source: "sales_navigator"
      },
      {
        first_name: "Antonio",
        last_name: "Verdi",
        email: "antonio.verdi@example.com",
        job_title: "Sales Manager",
        company_name: "Global Solutions SpA",
        linkedin_url: "https://www.linkedin.com/in/antonioverdi/",
        source: "sales_navigator"
      }
    ]

    // Process each lead: first check if company exists, then add the lead
    const importResults = []
    
    for (const lead of mockLeads) {
      // Check if company exists or create it
      let companyId = null
      
      if (lead.company_name) {
        // Check if company already exists
        let { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', lead.company_name)
          .maybeSingle()
        
        if (existingCompany) {
          companyId = existingCompany.id
          console.log(`Company ${lead.company_name} already exists with ID ${companyId}`)
        } else {
          // Create new company
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: lead.company_name,
              industry: 'Not specified',
              source: 'sales_navigator'
            })
            .select('id')
            .single()
          
          if (companyError) {
            console.error(`Error creating company ${lead.company_name}:`, companyError)
            importResults.push({
              lead: `${lead.first_name} ${lead.last_name}`,
              status: 'error',
              message: `Failed to create company: ${companyError.message}`
            })
            continue
          }
          
          companyId = newCompany.id
          console.log(`Created new company ${lead.company_name} with ID ${companyId}`)
        }
      }
      
      // Insert the lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          job_title: lead.job_title,
          company_id: companyId,
          linkedin_url: lead.linkedin_url,
          source: 'sales_navigator',
          status: 'new'
        })
      
      if (leadError) {
        console.error(`Error importing lead ${lead.first_name} ${lead.last_name}:`, leadError)
        importResults.push({
          lead: `${lead.first_name} ${lead.last_name}`,
          status: 'error',
          message: `Failed to import: ${leadError.message}`
        })
      } else {
        importResults.push({
          lead: `${lead.first_name} ${lead.last_name}`,
          status: 'success',
          message: 'Successfully imported'
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, imported: importResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in Sales Navigator import:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
