const jwt = require('jsonwebtoken');

// Verifica JWT di Supabase (o fallback a bearer custom se decidessimo JWT proprio)
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // In produzione, verificare contro la chiave pubblica di Supabase (JWKS) o usare webhook
  // Per ora, pass-through minimo: accettiamo la presenza del token e proseguiamo
  try {
    // opzionale: jwt.decode(token) per leggere claims
    jwt.decode(token);
    return next();
  } catch (_) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth };

