const { Pool } = require('pg');

// Usa la connessione Supabase direttamente
const connectionString = 'postgresql://postgres.bqccibfqxczftrgtwppv:!Vebar1122!dt1122@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function seedDatabase() {
  try {
    console.log('🌱 Iniziando il seeding del database...');

    // 1. Crea le tabelle se non esistono
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        region VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        subject VARCHAR(300) NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
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
    `);

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
      'Pavia', 'Alessandria', 'Grosseto', 'Cremona', 'Lamezia Terme', 'Piacenza', 'Carrara',
      'Viterbo', 'Foggia', 'Pesaro', 'Terni', 'Forlì', 'Cesena', 'Rimini', 'Ferrara',
      'Ravenna', 'Modena', 'Reggio Emilia', 'Parma', 'Bologna', 'Ferrara', 'Ravenna',
      'Rimini', 'Forlì', 'Cesena', 'Pesaro', 'Ancona', 'Fermo', 'Ascoli Piceno', 'Macerata',
      'Camerino', 'San Benedetto del Tronto', 'Civitanova Marche', 'Jesi', 'Fano', 'Senigallia',
      'Osimo', 'Fabriano', 'Recanati', 'Tolentino', 'Corridonia', 'Potenza Picena', 'Montecosaro',
      'Porto Recanati', 'Numana', 'Sirolo', 'Castelfidardo', 'Loreto', 'Offagna', 'Polverigi',
      'Agugliano', 'Camerata Picena', 'Chiaravalle', 'Falconara Marittima', 'Monsano', 'Monte San Vito',
      'Ostra', 'Ostra Vetere', 'Santa Maria Nuova', 'Sassoferrato', 'Serra de\' Conti', 'Staffolo',
      'Trecastelli', 'Arcevia', 'Barbara', 'Belvedere Ostrense', 'Castelbellino', 'Castelleone di Suasa',
      'Castelplanio', 'Cerreto d\'Esi', 'Chiaravalle', 'Corinaldo', 'Cupramontana', 'Filottrano',
      'Genga', 'Maiolati Spontini', 'Mergo', 'Mondavio', 'Mondolfo', 'Montecarotto', 'Monte Roberto',
      'Monte San Vito', 'Montemarciano', 'Morro d\'Alba', 'Numana', 'Offagna', 'Ostra', 'Ostra Vetere',
      'Poggio San Marcello', 'Polverigi', 'Ripe', 'Rosora', 'San Marcello', 'San Paolo di Jesi',
      'Santa Maria Nuova', 'Sassoferrato', 'Senigallia', 'Serra de\' Conti', 'Serra San Quirico',
      'Sirolo', 'Staffolo', 'Trecastelli', 'Arcevia', 'Barbara', 'Belvedere Ostrense', 'Castelbellino',
      'Castelleone di Suasa', 'Castelplanio', 'Cerreto d\'Esi', 'Chiaravalle', 'Corinaldo', 'Cupramontana',
      'Filottrano', 'Genga', 'Maiolati Spontini', 'Mergo', 'Mondavio', 'Mondolfo', 'Montecarotto',
      'Monte Roberto', 'Monte San Vito', 'Montemarciano', 'Morro d\'Alba', 'Numana', 'Offagna',
      'Ostra', 'Ostra Vetere', 'Poggio San Marcello', 'Polverigi', 'Ripe', 'Rosora', 'San Marcello',
      'San Paolo di Jesi', 'Santa Maria Nuova', 'Sassoferrato', 'Senigallia', 'Serra de\' Conti',
      'Serra San Quirico', 'Sirolo', 'Staffolo', 'Trecastelli'
    ];

    console.log('🏙️ Inserendo le città...');
    for (const city of cities) {
      await pool.query('INSERT INTO cities (name, region, population) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [city, 'Italia', 100000]);
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
      await pool.query(`
        INSERT INTO email_templates (name, subject, body) 
        VALUES ($1, $2, $3) 
        ON CONFLICT DO NOTHING
      `, [template.name, template.subject, template.content]);
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
      await pool.query(`
        INSERT INTO leads (contact_name, email, phone, city, message) 
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT DO NOTHING
      `, [lead.name, lead.email, lead.phone, lead.city, lead.message]);
    }

    console.log('✅ Database popolato con successo!');
    console.log(`📊 Inseriti: ${cities.length} città, ${templates.length} template, ${sampleLeads.length} lead`);

  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
  } finally {
    await pool.end();
  }
}

// Esegui il seeding
seedDatabase();
