# 🚀 IperMoney Lead Generation

Sistema completo di gestione lead per POS IperMoney con scraping automatico, campagne email e dashboard analytics.

## ⚡ Deploy Rapido

```bash
# 1. Esegui lo script di setup
./quick-deploy.sh

# 2. Segui le istruzioni per GitHub, Vercel e Railway
```

## 🐳 Deploy con Docker

```bash
# Per deployment locale con Docker
./docker-deploy.sh
```

## 🚀 Caratteristiche

- **Dashboard Analytics**: Statistiche complete sui lead e campagne
- **Scraping Automatico**: Estrazione automatica di lead da Google per città italiane
- **Gestione Email**: Template personalizzabili e invio batch con SendGrid
- **Form di Interesse**: Landing page pubblica per raccogliere lead
- **Gestione Campagne**: Tracking completo delle campagne email
- **Design Moderno**: Interfaccia responsive e user-friendly

## 🛠️ Stack Tecnologico

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router DOM
- Vite

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Supabase)
- SendGrid API
- Playwright (scraping)

### Database
- PostgreSQL (Supabase)
- Tabelle: leads, email_templates, campaigns, interest_forms

## 📦 Installazione

### Prerequisiti
- Node.js 18+
- npm o yarn
- Account Supabase
- Account SendGrid

### Setup Locale

1. **Clona il repository**
```bash
git clone <repository-url>
cd ipermoney
```

2. **Installa dipendenze**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Configura variabili d'ambiente**

**Backend (.env)**
```env
DATABASE_URL=your_supabase_connection_string
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=contact@firstdigitaltrade.com
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Esegui le migrazioni del database**
```bash
cd backend
npm run migrate
```

5. **Avvia l'applicazione**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connetti il repository GitHub a Vercel
2. Imposta le variabili d'ambiente in Vercel
3. Deploy automatico

### Backend (Railway)
1. Connetti il repository GitHub a Railway
2. Imposta le variabili d'ambiente
3. Deploy automatico

### Database
- Supabase è già configurato e pronto per la produzione

## 📊 Funzionalità

### Dashboard
- Statistiche lead in tempo reale
- Gestione lead con filtri e ricerca
- Invio email batch
- Tracking campagne

### Scraping
- Estrazione automatica da Google
- Targeting città italiane 50k+ abitanti
- Estrazione email da siti web
- Prevenzione duplicati

### Email Marketing
- Template personalizzabili
- Invio batch con SendGrid
- Tracking aperture e click
- Rate limiting

## 🔧 Configurazione

### Città per Scraping
Le città sono configurate in `backend/src/scraper.ts` con priorità:
1. Veneto
2. Nord Italia
3. Centro Italia
4. Sud Italia

### Template Email
I template sono gestibili dall'interfaccia admin con preview HTML.

## 📈 Monitoraggio

- Log completi delle operazioni
- Tracking campagne SendGrid
- Statistiche lead in tempo reale
- Error handling robusto

## 🤝 Contributi

1. Fork del repository
2. Crea un branch per la feature
3. Commit delle modifiche
4. Push al branch
5. Apri una Pull Request

## 📄 Licenza

Proprietario - IperMoney

## 📞 Supporto

Per supporto tecnico: contact@firstdigitaltrade.com
