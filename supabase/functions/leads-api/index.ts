import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Health check
    if (path === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // CORS test
    if (path === '/api/cors-test') {
      return new Response(
        JSON.stringify({ 
          status: 'CORS working!', 
          origin: req.headers.get('origin'),
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get cities (public endpoint)
    if (path === '/api/cities' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('cities')
        .select('id, name, region')
        .order('name')

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get email templates (public endpoint)
    if (path === '/api/email-templates' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('email_templates')
        .select('id, name, subject, body')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get leads (requires auth)
    if (path === '/api/leads' && method === 'GET') {
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data, error } = await supabaseClient
        .from('leads')
        .select(`
          id,
          company_name,
          city,
          region,
          status,
          email,
          phone,
          website,
          created_at,
          updated_at,
          email_sent_date,
          last_template_id,
          last_template_name,
          search_type,
          business_category,
          notes,
          email_templates(name)
        `)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get single lead (requires auth)
    if (path.startsWith('/api/leads/') && method === 'GET') {
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const leadId = path.split('/')[3]
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update lead notes (requires auth)
    if (path.startsWith('/api/leads/') && method === 'PATCH') {
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const leadId = path.split('/')[3]
      const body = await req.json()
      const { notes } = body

      const { data, error } = await supabaseClient
        .from('leads')
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get stats (requires auth)
    if (path === '/api/stats' && method === 'GET') {
      const { data: { user } } = await supabaseClient.auth.getUser()
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Get total leads
      const { count: total } = await supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Get email sent count
      const { count: email_sent } = await supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'email_sent')

      // Get new leads in last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: new_last_7d } = await supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      // Get not contacted count
      const { count: not_contacted } = await supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .is('email_sent_date', null)

      const stats = {
        total: total || 0,
        email_sent: email_sent || 0,
        new_last_7d: new_last_7d || 0,
        not_contacted: not_contacted || 0
      }

      return new Response(
        JSON.stringify(stats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default response for unmatched routes
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
