const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors({ 
  origin: [
    'http://localhost:5173',
    'https://lead-gen-ipm.vercel.app',
    'https://lead-gen-ipm-e17j.vercel.app',
    'https://lead-gen-oljhkl77t-mario-barbans-projects.vercel.app',
    'https://shiny-cactus-b5d036.netlify.app',
    'https://68ea6029a0f9200008e126de--shiny-cactus-b5d036.netlify.app'
  ], 
  credentials: true 
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const { requireAuth } = require('./auth.js');
const { pool } = require('./db.js');
const { sendEmailBatch } = require('./email.js');
const { scrapeCity } = require('./scraper.js');

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ ok: true });
});

// Endpoint pubblici per le città e template
app.get('/api/cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, region FROM cities ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero delle città:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/api/email-templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, subject, body FROM email_templates WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel recupero dei template:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/api/leads', requireAuth, async (req, res) => {
  const result = await pool.query(`
    SELECT 
      l.id, 
      l.company_name, 
      l.city, 
      l.region, 
      l.status, 
      l.email, 
      l.phone, 
      l.website, 
      l.created_at, 
      l.updated_at,
      l.email_sent_date,
      l.last_template_id,
      l.last_template_name,
      l.search_type,
      l.business_category,
      et.name as template_name
    FROM public.leads l
    LEFT JOIN public.email_templates et ON l.last_template_id = et.id
    ORDER BY l.created_at DESC 
    LIMIT 200
  `);
  res.json(result.rows);
});

app.get('/api/email-templates', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, subject, body, is_active, created_at, updated_at FROM public.email_templates ORDER BY id'
  );
  res.json(result.rows);
});

// Create email template
app.post('/api/email-templates', requireAuth, async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    
    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'Name, subject and body are required' });
    }

    const result = await pool.query(
      'INSERT INTO email_templates (name, subject, body, is_active, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING *',
      [name, subject, body]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
});

// Update email template
app.put('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body } = req.body;
    
    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'Name, subject and body are required' });
    }

    const result = await pool.query(
      'UPDATE email_templates SET name = $1, subject = $2, body = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, subject, body, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Delete email template
app.delete('/api/email-templates/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM email_templates WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

app.get('/api/stats', requireAuth, async (req, res) => {
  const q = await pool.query(`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status='email_sent')::int as email_sent,
      COUNT(*) FILTER (WHERE status='not_contacted')::int as not_contacted,
      COUNT(*) FILTER (WHERE status='interested')::int as interested,
      COUNT(*) FILTER (WHERE status='rejected')::int as rejected,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int as new_last_7d
    FROM public.leads
  `);
  const row = q.rows[0];
  const completionRate = row.total ? Math.round((row.interested / row.total) * 100) : 0;
  const emailedRate = row.total ? Math.round((row.email_sent / row.total) * 100) : 0;
  res.json({ ...row, completion_rate: completionRate, emailed_rate: emailedRate });
});

app.get('/api/cities', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT id, name, region FROM public.cities ORDER BY region, name LIMIT 200');
  res.json(result.rows);
});

// Campaigns endpoints
app.get('/api/campaigns', requireAuth, async (req, res) => {
  const result = await pool.query(`
    SELECT 
      c.id,
      c.name,
      c.template_id,
      c.total_sent,
      c.total_interested,
      c.created_at,
      et.name as template_name,
      c.open_rate,
      c.click_rate,
      c.total_clicks,
      c.last_updated
    FROM public.campaigns c
    LEFT JOIN public.email_templates et ON c.template_id = et.id
    ORDER BY c.created_at DESC
  `);
  res.json(result.rows);
});

app.post('/api/campaigns', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome campagna richiesto' });
  
  const result = await pool.query(
    'INSERT INTO public.campaigns (name) VALUES ($1) RETURNING *',
    [name]
  );
  res.json(result.rows[0]);
});

app.post('/api/campaigns/refresh-stats', requireAuth, async (req, res) => {
  try {
    // Prima aggiorna le statistiche base
    const statsResult = await pool.query(`
      UPDATE public.campaigns 
      SET 
        total_sent = (
          SELECT COUNT(*) 
          FROM public.leads 
          WHERE status = 'email_sent' 
          AND email_sent_date >= campaigns.created_at
        ),
        total_interested = (
          SELECT COUNT(*) 
          FROM public.leads 
          WHERE status = 'interested' 
          AND email_sent_date >= campaigns.created_at
        ),
        last_updated = now()
      WHERE id = campaigns.id
      RETURNING *
    `);

    // Per ora aggiorniamo solo le statistiche base (SendGrid sarà aggiunto in seguito)
    console.log('Statistiche aggiornate per', statsResult.rowCount, 'campagne');
    
    res.json({ success: true, updated: statsResult.rowCount });
  } catch (error) {
    console.error('Error refreshing stats:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento delle statistiche' });
  }
});

app.post('/api/send-campaign', requireAuth, async (req, res) => {
  const { leadIds, templateId } = req.body;
  if (!Array.isArray(leadIds) || !templateId) return res.status(400).json({ error: 'Payload non valido' });
  const tpl = await pool.query('SELECT subject, body, name FROM public.email_templates WHERE id=$1', [templateId]);
  if (!tpl.rowCount) return res.status(404).json({ error: 'Template non trovato' });
  const leads = await pool.query('SELECT id, email FROM public.leads WHERE id = ANY($1::bigint[]) AND email IS NOT NULL', [leadIds]);
  const emails = leads.rows.map((r) => r.email).filter(Boolean);
  if (!emails.length) return res.json({ sent: 0 });
  await sendEmailBatch(emails, tpl.rows[0].subject, tpl.rows[0].body, templateId);
  await pool.query(
    'UPDATE public.leads SET status=\'email_sent\', email_sent_date=now(), last_template_id=$1, last_template_name=$2 WHERE id = ANY($3::bigint[])', 
    [templateId, tpl.rows[0].name, leadIds]
  );
  
  // Crea o aggiorna una campagna automatica per questo template
  const campaignName = `Campagna ${tpl.rows[0].name} - ${new Date().toLocaleDateString('it-IT')}`;
  await pool.query(`
    INSERT INTO public.campaigns (name, template_id, total_sent, total_interested, created_at)
    VALUES ($1, $2, $3, 0, now())
    ON CONFLICT (template_id) 
    DO UPDATE SET 
      total_sent = campaigns.total_sent + $3,
      last_updated = now()
  `, [campaignName, templateId, emails.length]);
  
  res.json({ sent: emails.length });
});

// Send test email
app.post('/api/send-test-email', requireAuth, async (req, res) => {
  const { email, templateId } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email richiesto' });
  
  try {
    let template;
    if (templateId) {
      // Use specific template
      template = await pool.query('SELECT * FROM email_templates WHERE id = $1', [templateId]);
    } else {
      // Use first available template
      template = await pool.query('SELECT * FROM email_templates ORDER BY id LIMIT 1');
    }
    
    if (!template.rows.length) return res.status(404).json({ error: 'Nessun template trovato' });
    
    await sendEmailBatch([email], `[TEST] ${template.rows[0].subject}`, template.rows[0].body, template.rows[0].id);
    
    res.json({ sent: 1, email, templateName: template.rows[0].name });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Interest form pubblico
app.post('/api/public/interest', async (req, res) => {
  const { company_name, contact_person, email, phone, city, message } = req.body || {};
  if (!company_name || !email) return res.status(400).json({ error: 'Dati insufficienti' });
  await pool.query(
    'INSERT INTO public.interest_forms(company_name, contact_person, email, phone, city, message) VALUES($1,$2,$3,$4,$5,$6)',
    [company_name, contact_person, email, phone, city, message]
  );
  try { await sendEmailBatch(['contact@firstdigitaltrade.com'], 'Nuovo interesse IperMoney', `Azienda: ${company_name}\nContatto: ${contact_person}\nEmail: ${email}\nTelefono: ${phone}\nCittà: ${city}\nMessaggio: ${message}`); } catch {}
  res.json({ ok: true });
});

// Endpoint per visualizzare email nel browser
app.get('/api/email-preview/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const result = await pool.query('SELECT subject, body FROM email_templates WHERE id = $1', [templateId]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Template non trovato');
    }
    
    const template = result.rows[0];
    
    // Aggiungi il link "visualizza nel browser" al template
    const htmlWithViewLink = template.body + `
      <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #6c757d;">
        <p>Se non riesci a visualizzare correttamente questa email, <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/email-preview/${templateId}" style="color: #ff8c00;">clicca qui per visualizzarla nel browser</a></p>
      </div>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlWithViewLink);
  } catch (error) {
    console.error('Error serving email preview:', error);
    res.status(500).send('Errore nel caricamento del template');
  }
});

// Clear all leads
app.delete('/api/leads/clear', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM leads');
    res.json({ message: `Deleted ${result.rowCount} leads` });
  } catch (error) {
    console.error('Error clearing leads:', error);
    res.status(500).json({ error: 'Failed to clear leads' });
  }
});

// Get single lead
app.get('/api/leads/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Delete single lead
app.delete('/api/leads/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Update lead notes
app.patch('/api/leads/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const result = await pool.query(
      'UPDATE leads SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [notes, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Scraping endpoint
app.post('/api/scrape', requireAuth, async (req, res) => {
  const { city, region } = req.body || {};
  if (!city) return res.status(400).json({ error: 'city richiesto' });
  const count = await scrapeCity(city, region, 25);
  res.json({ scraped: count });
});

const port = process.env.PORT || 4000;
// Settings endpoints
app.get('/api/settings', requireAuth, async (req, res) => {
  // Restituisce le impostazioni di default per ora
  res.json({
    sendgrid_api_key: process.env.SENDGRID_API_KEY ? '***' : '',
    email_sender: process.env.EMAIL_SENDER || 'contact@firstdigitaltrade.com',
    max_leads_per_scrape: 25,
    scrape_delay: 2000
  });
});

app.put('/api/settings', requireAuth, async (req, res) => {
  const { sendgrid_api_key, email_sender, max_leads_per_scrape, scrape_delay } = req.body;
  
  // Qui potresti salvare le impostazioni in un database
  // Per ora restituiamo solo un successo
  res.json({ success: true, message: 'Impostazioni aggiornate' });
});

app.listen(port, () => {
  console.log('Server listening on port ' + port);
});
