const { Pool } = require('pg');

// Connessione al database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.bqccibfqxczftrgtwppv:!Vebar1122!dt1122@aws-1-eu-north-1.pooler.supabase.com:5432/postgres'
});

async function addNotesColumn() {
  try {
    console.log('🔧 Aggiungendo colonna notes alla tabella leads...');
    
    // Aggiungi la colonna notes se non esiste
    await pool.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);
    
    console.log('✅ Colonna notes aggiunta con successo!');
    
    // Verifica che la colonna sia stata aggiunta
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'notes'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verifica: Colonna notes presente nella tabella leads');
      console.log(`   Tipo: ${result.rows[0].data_type}`);
      console.log(`   Nullable: ${result.rows[0].is_nullable}`);
    } else {
      console.log('❌ Errore: Colonna notes non trovata');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Errore durante l\'aggiunta della colonna:', error);
    await pool.end();
  }
}

addNotesColumn();
