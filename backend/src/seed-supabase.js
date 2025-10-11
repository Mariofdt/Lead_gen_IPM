const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://bqccibfqxczftrgtwppv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxY2NpYmZxeGN6ZnRyZ3R3cHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3Mjg3NCwiZXhwIjoyMDUwNTQ4ODc0fQ.XXXXXXXXXXXX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Iniziando il seeding del database Supabase...');

    // 1. Crea le tabelle se non esistono
    console.log('📋 Creando le tabelle...');
    
    // Città
    const { error: citiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS cities (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          region VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Template email
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS email_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          subject VARCHAR(300) NOT NULL,
          content TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // Lead
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          email VARCHAR(200) NOT NULL,
          phone VARCHAR(50),
          city VARCHAR(100),
          message TEXT,
          status VARCHAR(50) DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    // 2. Inserisci le città italiane
    const cities = [
      'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze',
      'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 'Trieste', 'Brescia',
      'Parma', 'Taranto', 'Prato', 'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia',
      'Livorno', 'Ravenna', 'Cagliari', 'Foggia', 'Rimini', 'Salerno', 'Ferrara', 'Sassari',
      'Monza', 'Latina', 'Bergamo', 'Forlì', 'Trento', 'Vicenza', 'Terni', 'Bolzano',
      'Novara', 'Piacenza', 'Ancona', 'Andria', 'Arezzo', 'Udine', 'Cesena', 'Lecce',
      'Pesaro', 'La Spezia', 'Brindisi', 'Pisa', 'Como', 'Varese', 'Treviso', 'Busto Arsizio',
      'Vigevano', 'Carpi', 'Massa', 'Imola', 'Fiumicino', 'Cinisello Balsamo', 'Sesto San Giovanni',
      'Pavia', 'Alessandria', 'Grosseto', 'Cremona', 'Lamezia Terme', 'Carrara',
      'Viterbo', 'Foggia', 'Pesaro', 'Terni', 'Forlì', 'Cesena', 'Rimini', 'Ferrara',
      'Ravenna', 'Modena', 'Reggio Emilia', 'Parma', 'Bologna'
    ];

    console.log('🏙️ Inserendo le città...');
    for (const city of cities) {
      const { error } = await supabase
        .from('cities')
        .insert([{ name: city }])
        .select();
      
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Errore inserendo ${city}:`, error.message);
      }
    }

    // 3. Inserisci template email
    const templates = [
      {
        name: 'Benvenuto IperMoney',
        subject: 'Benvenuto in IperMoney - La tua partnership POS',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00bcd4;">🚀 Benvenuto in IperMoney!</h2>
            <p>Ciao {{name}},</p>
            <p>Grazie per il tuo interesse in IperMoney POS. Siamo entusiasti di presentarti la nostra soluzione di partnership white label.</p>
            <h3>🎯 Cosa ti offriamo:</h3>
            <ul>
              <li>✅ Sistema POS completo e personalizzabile</li>
              <li>✅ Supporto tecnico 24/7</li>
              <li>✅ Formazione per il tuo team</li>
              <li>✅ Marketing materials inclusi</li>
            </ul>
            <p>Il nostro team ti contatterà entro 24 ore per discutere i dettagli della partnership.</p>
            <p>Grazie per la fiducia!</p>
            <p><strong>Team IperMoney</strong></p>
          </div>
        `
      },
      {
        name: 'Follow-up Partnership',
        subject: 'IperMoney - Pronti per iniziare la partnership?',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00bcd4;">🤝 Partnership IperMoney</h2>
            <p>Ciao {{name}},</p>
            <p>Abbiamo ricevuto la tua richiesta per la partnership IperMoney POS. Siamo pronti a supportarti nel tuo business!</p>
            <h3>📋 Prossimi passi:</h3>
            <ol>
              <li>📞 Chiamata di presentazione (30 min)</li>
              <li>📋 Analisi delle tue esigenze</li>
              <li>🎯 Proposta personalizzata</li>
              <li>📝 Contratto di partnership</li>
            </ol>
            <p>Contattaci al <strong>+39 351 935 6303</strong> per fissare un appuntamento.</p>
            <p>Grazie per aver scelto IperMoney!</p>
            <p><strong>Mario Barban<br>IperMoney Team</strong></p>
          </div>
        `
      },
      {
        name: 'Promozione Speciale',
        subject: 'IperMoney - Offerta speciale per te!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00bcd4;">🎉 Offerta Speciale IperMoney!</h2>
            <p>Ciao {{name}},</p>
            <p>Abbiamo preparato un'offerta speciale per te! Per un tempo limitato, puoi ottenere:</p>
            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>🔥 Offerta Limitata:</h3>
              <ul>
                <li>💰 <strong>50% di sconto</strong> sui costi di setup</li>
                <li>🎁 <strong>Marketing kit gratuito</strong> del valore di €500</li>
                <li>📞 <strong>Supporto prioritario</strong> per 6 mesi</li>
                <li>🏆 <strong>Formazione personalizzata</strong> inclusa</li>
              </ul>
            </div>
            <p>Questa offerta è valida solo per i prossimi 7 giorni!</p>
            <p>Contattaci subito: <strong>+39 351 935 6303</strong></p>
            <p>Non perdere questa opportunità!</p>
            <p><strong>Team IperMoney</strong></p>
          </div>
        `
      }
    ];

    console.log('📧 Inserendo i template email...');
    for (const template of templates) {
      const { error } = await supabase
        .from('email_templates')
        .insert([template])
        .select();
      
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Errore inserendo template ${template.name}:`, error.message);
      }
    }

    // 4. Inserisci alcuni lead di esempio
    const sampleLeads = [
      {
        name: 'Mario Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 123 456 7890',
        city: 'Roma',
        message: 'Interessato alla partnership IperMoney POS'
      },
      {
        name: 'Giulia Bianchi',
        email: 'giulia.bianchi@example.com',
        phone: '+39 987 654 3210',
        city: 'Milano',
        message: 'Vorrei maggiori informazioni sui costi'
      },
      {
        name: 'Luca Verdi',
        email: 'luca.verdi@example.com',
        phone: '+39 555 123 4567',
        city: 'Napoli',
        message: 'Sono interessato al sistema POS per il mio negozio'
      }
    ];

    console.log('👥 Inserendo lead di esempio...');
    for (const lead of sampleLeads) {
      const { error } = await supabase
        .from('leads')
        .insert([lead])
        .select();
      
      if (error && !error.message.includes('duplicate key')) {
        console.log(`Errore inserendo lead ${lead.name}:`, error.message);
      }
    }

    console.log('✅ Database popolato con successo!');
    console.log(`📊 Inseriti: ${cities.length} città, ${templates.length} template, ${sampleLeads.length} lead`);

  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
  }
}

// Esegui il seeding
seedDatabase();
