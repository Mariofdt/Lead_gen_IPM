const { Pool } = require('pg');

// Connessione al database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.bqccibfqxczftrgtwppv:!Vebar1122!dt1122@aws-1-eu-north-1.pooler.supabase.com:5432/postgres'
});

async function cleanDuplicates() {
  try {
    console.log('🧹 Inizio pulizia duplicati...');
    
    // Prima controlliamo quanti duplicati ci sono
    const beforeResult = await pool.query('SELECT COUNT(*) as total FROM cities');
    const beforeUniqueResult = await pool.query('SELECT COUNT(DISTINCT name) as unique_cities FROM cities');
    
    console.log(`📊 Prima della pulizia:`);
    console.log(`   Totale città: ${beforeResult.rows[0].total}`);
    console.log(`   Città uniche: ${beforeUniqueResult.rows[0].unique_cities}`);
    
    // Creiamo una tabella temporanea con le città uniche
    await pool.query(`
      CREATE TEMP TABLE cities_unique AS 
      SELECT DISTINCT ON (name) id, name, region, population 
      FROM cities 
      ORDER BY name, id
    `);
    
    // Contiamo quante città uniche abbiamo
    const uniqueCount = await pool.query('SELECT COUNT(*) FROM cities_unique');
    console.log(`   Città uniche trovate: ${uniqueCount.rows[0].count}`);
    
    // Svuotiamo la tabella originale
    await pool.query('DELETE FROM cities');
    
    // Reinseriamo solo le città uniche
    await pool.query(`
      INSERT INTO cities (id, name, region, population)
      SELECT id, name, region, population FROM cities_unique
    `);
    
    // Verifichiamo il risultato
    const afterResult = await pool.query('SELECT COUNT(*) as total FROM cities');
    const afterUniqueResult = await pool.query('SELECT COUNT(DISTINCT name) as unique_cities FROM cities');
    
    console.log(`\n✅ Dopo la pulizia:`);
    console.log(`   Totale città: ${afterResult.rows[0].total}`);
    console.log(`   Città uniche: ${afterUniqueResult.rows[0].unique_cities}`);
    
    console.log(`\n🎉 Pulizia completata! Rimosse ${beforeResult.rows[0].total - afterResult.rows[0].total} città duplicate.`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    await pool.end();
  }
}

cleanDuplicates();
