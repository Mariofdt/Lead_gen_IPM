const { chromium } = require('playwright');
const { pool } = require('./db.js');

async function saveLead(lead) {
  const exists = await pool.query(
    `SELECT id FROM public.leads WHERE lower(company_name)=lower($1) AND lower(COALESCE(city,''))=lower(COALESCE($2,'')) LIMIT 1`,
    [lead.company_name, lead.city || '']
  );
  if (exists.rowCount) return;
  await pool.query(
    `INSERT INTO public.leads(company_name, address, phone, email, website, city, region, status, search_type, business_category)
     VALUES($1,$2,$3,$4,$5,$6,$7,'not_contacted',$8,$9)`,
    [lead.company_name, lead.address || null, lead.phone || null, lead.email || null, lead.website || null, lead.city || null, lead.region || null, lead.search_type || null, lead.business_category || null]
  );
}

async function extractEmailFromElement(element) {
  try {
    // Cerca email nel testo dell'elemento
    const text = await element.innerText();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    
    if (emails && emails.length > 0) {
      // Filtra email valide (non no-reply, info generiche, etc.)
      const validEmails = emails.filter((email) => 
        !/no-reply|noreply|donotreply|info@|admin@|webmaster@|postmaster@/i.test(email)
      );
      
      if (validEmails.length > 0) {
        return validEmails[0]; // Prendi la prima email valida
      }
    }
    
    return null;
  } catch (error) {
    console.log(`Error extracting email from element:`, error);
    return null;
  }
}

async function extractEmailFromSite(page, url) {
  try {
    console.log(`Visiting: ${url}`);
    
    // Naviga al sito con gestione errori migliorata
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Aspetta che la pagina si carichi
    await page.waitForTimeout(2000);
    
    // Cerca email nel contenuto della pagina
    const content = await page.content();
    
    // Regex per trovare email - più aggressivo
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = content.match(emailRegex);
    
    if (emails && emails.length > 0) {
      // Filtra email valide (meno restrittivo per trovare più email)
      const validEmails = emails.filter((email) => 
        !/no-reply|noreply|donotreply|webmaster@|postmaster@|example\.com|test\.com|localhost/i.test(email)
      );
      
      if (validEmails.length > 0) {
        return validEmails[0]; // Prendi la prima email valida
      }
    }
    
    // Cerca anche nei link mailto
    try {
      const mailtoLinks = await page.$$eval('a[href^="mailto:"]', (links) => 
        links.map(link => link.href.replace('mailto:', ''))
      );
      
      if (mailtoLinks.length > 0) {
        const validMailto = mailtoLinks.filter((email) => 
          !/no-reply|noreply|donotreply|webmaster@|postmaster@|example\.com|test\.com/i.test(email)
        );
        if (validMailto.length > 0) {
          return validMailto[0];
        }
      }
    } catch (mailtoError) {
      // Ignora errori nei link mailto
    }
    
    // Cerca nelle pagine di contatto
    try {
      const contactLinks = await page.$$eval('a[href*="contact"], a[href*="contatti"], a[href*="contatto"]', (links) => 
        links.map(link => link.href)
      );
      
      for (const contactUrl of contactLinks.slice(0, 2)) { // Massimo 2 pagine di contatto
        try {
          await page.goto(contactUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
          await page.waitForTimeout(1000);
          
          const contactContent = await page.content();
          const contactEmails = contactContent.match(emailRegex);
          
          if (contactEmails && contactEmails.length > 0) {
            const validContactEmails = contactEmails.filter((email) => 
              !/no-reply|noreply|donotreply|webmaster@|postmaster@|example\.com|test\.com/i.test(email)
            );
            if (validContactEmails.length > 0) {
              return validContactEmails[0];
            }
          }
        } catch (contactError) {
          // Ignora errori nelle pagine di contatto
        }
      }
    } catch (contactSearchError) {
      // Ignora errori nella ricerca di pagine di contatto
    }
    
    return null;
  } catch (error) {
    console.log(`Error extracting email from ${url}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

function determineBusinessCategory(title) {
  const titleLower = title.toLowerCase();
  
  // Categorie business basate su parole chiave nel titolo
  if (titleLower.includes('ristorante') || titleLower.includes('pizzeria') || titleLower.includes('trattoria') || titleLower.includes('osteria')) {
    return 'Ristoranti';
  }
  if (titleLower.includes('bar') || titleLower.includes('caffè') || titleLower.includes('caffe')) {
    return 'Bar e Caffè';
  }
  if (titleLower.includes('negozio') || titleLower.includes('shop') || titleLower.includes('boutique') || titleLower.includes('store')) {
    return 'Negozi';
  }
  if (titleLower.includes('hotel') || titleLower.includes('albergo') || titleLower.includes('b&b') || titleLower.includes('bed and breakfast')) {
    return 'Hotel e Alloggi';
  }
  if (titleLower.includes('farmacia') || titleLower.includes('farmacie')) {
    return 'Farmacie';
  }
  if (titleLower.includes('supermercato') || titleLower.includes('supermercati') || titleLower.includes('grocery')) {
    return 'Supermercati';
  }
  if (titleLower.includes('parrucchiere') || titleLower.includes('barbiere') || titleLower.includes('estetica') || titleLower.includes('salone')) {
    return 'Bellezza e Benessere';
  }
  if (titleLower.includes('palestra') || titleLower.includes('fitness') || titleLower.includes('sport')) {
    return 'Sport e Fitness';
  }
  if (titleLower.includes('officina') || titleLower.includes('meccanico') || titleLower.includes('auto')) {
    return 'Automotive';
  }
  if (titleLower.includes('ufficio') || titleLower.includes('uffici') || titleLower.includes('servizi')) {
    return 'Uffici e Servizi';
  }
  if (titleLower.includes('clinica') || titleLower.includes('medico') || titleLower.includes('dentista') || titleLower.includes('veterinario')) {
    return 'Sanità';
  }
  if (titleLower.includes('scuola') || titleLower.includes('asilo') || titleLower.includes('educazione')) {
    return 'Educazione';
  }
  if (titleLower.includes('banca') || titleLower.includes('finanza') || titleLower.includes('assicurazione')) {
    return 'Finanza e Assicurazioni';
  }
  if (titleLower.includes('tecnologia') || titleLower.includes('software') || titleLower.includes('informatica')) {
    return 'Tecnologia';
  }
  
  // Categoria di default
  return 'Altro';
}

async function scrapeCity(city, region, max = 25) {
  const query = `vendita registratori di cassa ${city}`;
  let browser = null;
  const results = [];
  try {
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    const ctx = await browser.newContext({ 
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'it-IT',
      timezoneId: 'Europe/Rome'
    });
    const page = await ctx.newPage();
    
    console.log(`Scraping for: ${query}`);
    await page.goto('https://www.google.com/search?q=' + encodeURIComponent(query), { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Aspetta che i risultati si carichino
    await page.waitForTimeout(3000);
    
    // Debug: salva screenshot (solo in modalità debug)
    // await page.screenshot({ path: 'debug-google.png' });
    // console.log('Screenshot saved as debug-google.png');
    
    // Controlla se c'è un captcha
    const captcha = await page.$('#captcha-form, .g-recaptcha, [data-captcha]');
    if (captcha) {
      console.log('Captcha detected! Cannot proceed with scraping.');
      return 0;
    }
    
    // Prova diversi selettori per i risultati di Google
    const selectors = [
      'div[data-sokoban-container] a[href^="http"]',
      'div.g a[href^="http"]',
      'div[jscontroller] a[href^="http"]',
      'h3 a[href^="http"]',
      'div[data-ved] a[href^="http"]',
      'a[href^="http"]:not([href*="google.com"]):not([href*="youtube.com"]):not([href*="facebook.com"])'
    ];
    
    let items = [];
    for (const selector of selectors) {
      items = await page.$$(selector);
      if (items.length > 0) {
        console.log(`Found ${items.length} results with selector: ${selector}`);
        break;
      }
    }
    
    console.log(`Processing ${items.length} items...`);
    
    // Estrai tutti i dati prima di processare
    const itemsData = [];
    
    for (const a of items) {
      try {
        const href = await a.getAttribute('href');
        const title = await a.innerText();
        
        if (href && title && title.trim().length >= 3) {
          itemsData.push({ href, title: title.trim() });
        }
      } catch (err) {
        console.log('Error extracting item data:', err);
        continue;
      }
    }
    
    console.log(`Processing ${itemsData.length} items...`);
    
    for (const item of itemsData) {
      if (results.length >= max) break;
      
      const { href, title } = item;
      
      // Filtra domini Google e altri non utili
      if (/google\.|youtube\.|facebook\.|instagram\.|linkedin\.|twitter\.|paginegialle\.|subito\./i.test(href)) continue;
      
      console.log(`Processing: ${title} - ${href}`);
      
      // Visita il sito per cercare email
      const email = await extractEmailFromSite(page, href);
      
      if (!email) {
        console.log(`No email found for: ${title}`);
        continue; // Salta se non ha email
      }
      
      // Determina la categoria business basata sul titolo e contenuto
      const businessCategory = determineBusinessCategory(title);
      
      const lead = {
        company_name: title.slice(0, 200),
        website: href,
        email: email,
        city,
        region: region,
        search_type: 'registratori di cassa',
        business_category: businessCategory,
      };
      
      results.push(lead);
      console.log(`Added lead with email: ${lead.company_name} - ${email}`);
      
      // Rate limiting
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  console.log(`Saving ${results.length} leads...`);
  
  // salva con dedup
  for (const r of results) {
    try {
      await saveLead(r);
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.log('Error saving lead:', err);
    }
  }
  
  console.log(`Scraping completed. Found ${results.length} new leads.`);
  return results.length;
}

module.exports = { scrapeCity };

