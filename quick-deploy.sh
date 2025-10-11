#!/bin/bash

# 🚀 Deploy Rapido per IperMoney Lead Generation
# Script semplificato per deployment immediato

set -e

# Colori
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy Rapido IperMoney Lead Generation${NC}"
echo "=============================================="
echo ""

# Verifica prerequisiti
echo -e "${BLUE}📋 Verifico prerequisiti...${NC}"

if ! command -v git &> /dev/null; then
    echo "❌ Git non installato"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installato"
    exit 1
fi

echo "✅ Prerequisiti OK"
echo ""

# Crea .gitignore
echo -e "${BLUE}📝 Creo .gitignore...${NC}"
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.env.production.local
.env.development.local
dist/
build/
.next/
out/
.DS_Store
*.log
EOF

# Inizializza Git
echo -e "${BLUE}🔧 Inizializzo Git...${NC}"
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: IperMoney Lead Generation"
fi

# Installa dipendenze
echo -e "${BLUE}📦 Installo dipendenze...${NC}"
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Crea file di configurazione
echo -e "${BLUE}⚙️ Creo file di configurazione...${NC}"

# Railway config
cat > backend/railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Vercel config
cat > frontend/vercel.json << 'EOF'
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOF

echo "✅ Configurazione completata"
echo ""

# Istruzioni per il deployment
echo -e "${GREEN}🎉 Setup completato!${NC}"
echo ""
echo -e "${YELLOW}📋 Prossimi passi per il deployment:${NC}"
echo ""
echo "1. 🌐 Crea repository GitHub:"
echo "   - Vai su https://github.com/new"
echo "   - Nome: ipermoney-lead-generation"
echo "   - Crea repository"
echo ""
echo "2. 📤 Carica il codice:"
echo "   git remote add origin https://github.com/TUO_USERNAME/ipermoney-lead-generation.git"
echo "   git push -u origin main"
echo ""
echo "3. 🚂 Deploy Backend su Railway:"
echo "   - Vai su https://railway.app"
echo "   - Login con GitHub"
echo "   - 'New Project' > 'Deploy from GitHub repo'"
echo "   - Seleziona il repository"
echo "   - Root Directory: backend"
echo "   - Aggiungi variabili d'ambiente:"
echo "     DATABASE_URL=your_supabase_url"
echo "     SENDGRID_API_KEY=your_sendgrid_key"
echo "     SENDGRID_FROM_EMAIL=contact@firstdigitaltrade.com"
echo "     JWT_SECRET=your_jwt_secret"
echo ""
echo "4. 🌟 Deploy Frontend su Vercel:"
echo "   - Vai su https://vercel.com"
echo "   - Login con GitHub"
echo "   - 'New Project' > Import repository"
echo "   - Root Directory: frontend"
echo "   - Aggiungi variabili d'ambiente:"
echo "     VITE_API_URL=https://tuo-backend.railway.app"
echo "     VITE_SUPABASE_URL=your_supabase_url"
echo "     VITE_SUPABASE_ANON_KEY=your_supabase_key"
echo ""
echo "5. 🗄️ Esegui migrazioni database:"
echo "   - Vai su Railway dashboard"
echo "   - Apri la console del backend"
echo "   - Esegui: npm run migrate"
echo ""
echo -e "${GREEN}🎯 L'applicazione sarà live su Vercel!${NC}"
echo ""
echo "📖 Per maggiori dettagli: DEPLOYMENT_GUIDE.md"


