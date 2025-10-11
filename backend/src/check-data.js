const { Pool } = require('pg');

// Usa la connessione Supabase direttamente
const connectionString = 'postgresql://postgres.bqccibfqxczftrgtwppv:!Vebar1122!dt1122@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function checkData() {
  try {
    console.log('🔍 Controllando i dati nel database...');

    // Controlla le città
    const citiesResult = await pool.query('SELECT COUNT(*) as count FROM cities');
    console.log(`📊 Città nel database: ${citiesResult.rows[0].count}`);

    // Controlla i template email
    const templatesResult = await pool.query('SELECT COUNT(*) as count FROM email_templates');
    console.log(`📧 Template email nel database: ${templatesResult.rows[0].count}`);

    // Controlla i lead
    const leadsResult = await pool.query('SELECT COUNT(*) as count FROM leads');
    console.log(`👥 Lead nel database: ${leadsResult.rows[0].count}`);

    // Mostra alcune città
    const sampleCities = await pool.query('SELECT name, region FROM cities LIMIT 5');
    console.log('🏙️ Prime 5 città:');
    sampleCities.rows.forEach(city => {
      console.log(`  - ${city.name} (${city.region})`);
    });

    // Mostra alcuni template
    const sampleTemplates = await pool.query('SELECT name, subject FROM email_templates LIMIT 3');
    console.log('📧 Template email:');
    sampleTemplates.rows.forEach(template => {
      console.log(`  - ${template.name}: ${template.subject}`);
    });

  } catch (error) {
    console.error('❌ Errore durante il controllo:', error);
  } finally {
    await pool.end();
  }
}

checkData();
