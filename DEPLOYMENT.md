# 🚀 Guida al Deployment

## Prerequisiti
- Account GitHub
- Account Vercel (gratuito)
- Account Railway (gratuito)
- Account Supabase (già configurato)

## 📋 Passaggi per il Deployment

### 1. Preparazione Repository

1. **Crea un repository GitHub**
   - Vai su GitHub.com
   - Crea un nuovo repository chiamato `ipermoney-lead-generation`
   - Non inizializzare con README (ne abbiamo già uno)

2. **Carica il codice**
```bash
cd /Users/mariobarban/Desktop/ipermoney
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tuusuario/ipermoney-lead-generation.git
git push -u origin main
```

### 2. Deployment Backend (Railway)

1. **Vai su Railway.app**
   - Registrati con GitHub
   - Clicca "New Project"
   - Seleziona "Deploy from GitHub repo"
   - Scegli il repository `ipermoney-lead-generation`

2. **Configura il progetto**
   - Nome: `ipermoney-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Imposta le variabili d'ambiente**
   - `DATABASE_URL`: La tua stringa di connessione Supabase
   - `SENDGRID_API_KEY`: La tua API key SendGrid
   - `SENDGRID_FROM_EMAIL`: `contact@firstdigitaltrade.com`
   - `JWT_SECRET`: Una stringa casuale sicura
   - `PORT`: `4000`

4. **Deploy**
   - Railway farà il deploy automaticamente
   - Prendi nota dell'URL del backend (es. `https://ipermoney-backend.railway.app`)

### 3. Deployment Frontend (Vercel)

1. **Vai su Vercel.com**
   - Registrati con GitHub
   - Clicca "New Project"
   - Importa il repository `ipermoney-lead-generation`

2. **Configura il progetto**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Imposta le variabili d'ambiente**
   - `VITE_API_URL`: L'URL del backend Railway (es. `https://ipermoney-backend.railway.app`)
   - `VITE_SUPABASE_URL`: La tua URL Supabase
   - `VITE_SUPABASE_ANON_KEY`: La tua chiave anonima Supabase

4. **Deploy**
   - Vercel farà il deploy automaticamente
   - Prendi nota dell'URL del frontend (es. `https://ipermoney-lead-generation.vercel.app`)

### 4. Configurazione Database

1. **Esegui le migrazioni**
   - Vai sul backend Railway
   - Apri la console
   - Esegui: `npm run migrate`

2. **Verifica le tabelle**
   - Vai su Supabase Dashboard
   - Controlla che le tabelle siano create correttamente

### 5. Test dell'Applicazione

1. **Testa il frontend**
   - Vai sull'URL Vercel
   - Verifica che si carichi correttamente

2. **Testa il backend**
   - Vai su `https://tuo-backend.railway.app/health`
   - Dovrebbe rispondere con `{ status: 'ok' }`

3. **Testa l'integrazione**
   - Prova a fare login
   - Verifica che i dati si carichino correttamente

## 🔧 Configurazioni Aggiuntive

### CORS
Il backend è già configurato per accettare richieste dal frontend Vercel.

### Rate Limiting
SendGrid ha limiti di invio che dipendono dal piano:
- Piano gratuito: 100 email/giorno
- Piano a pagamento: limiti più alti

### Monitoring
- **Railway**: Dashboard con log e metriche
- **Vercel**: Dashboard con analytics
- **Supabase**: Dashboard con query e performance

## 🚨 Troubleshooting

### Problemi Comuni

1. **Backend non si avvia**
   - Controlla le variabili d'ambiente
   - Verifica che il database sia accessibile

2. **Frontend non si connette al backend**
   - Controlla `VITE_API_URL`
   - Verifica che il backend sia online

3. **Errori di database**
   - Esegui le migrazioni
   - Controlla la stringa di connessione

4. **Errori SendGrid**
   - Verifica l'API key
   - Controlla i limiti del piano

### Log e Debug

- **Railway**: Vai su "Deployments" > "View Logs"
- **Vercel**: Vai su "Functions" > "View Logs"
- **Supabase**: Vai su "Logs" nel dashboard

## 📞 Supporto

Se hai problemi:
1. Controlla i log delle piattaforme
2. Verifica le variabili d'ambiente
3. Testa localmente prima di deployare
4. Contatta il supporto delle piattaforme se necessario

## 🎉 Completato!

Una volta completati tutti i passaggi, avrai:
- ✅ Frontend live su Vercel
- ✅ Backend live su Railway  
- ✅ Database su Supabase
- ✅ Applicazione completamente funzionante

L'URL finale sarà quello del frontend Vercel, che si connetterà automaticamente al backend Railway e al database Supabase.
