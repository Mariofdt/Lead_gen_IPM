#!/bin/bash

# 🚀 Script di Deploy Automatico per IperMoney Lead Generation
# Questo script automatizza il deployment su GitHub, Vercel e Railway

set -e  # Exit on any error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica prerequisiti
check_prerequisites() {
    print_status "Verifico i prerequisiti..."
    
    # Verifica Git
    if ! command -v git &> /dev/null; then
        print_error "Git non è installato. Installa Git prima di continuare."
        exit 1
    fi
    
    # Verifica Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js non è installato. Installa Node.js prima di continuare."
        exit 1
    fi
    
    # Verifica npm
    if ! command -v npm &> /dev/null; then
        print_error "npm non è installato. Installa npm prima di continuare."
        exit 1
    fi
    
    print_success "Prerequisiti verificati!"
}

# Inizializza repository Git
init_git_repo() {
    print_status "Inizializzo il repository Git..."
    
    cd /Users/mariobarban/Desktop/ipermoney
    
    # Inizializza Git se non esiste
    if [ ! -d ".git" ]; then
        git init
        print_success "Repository Git inizializzato"
    else
        print_warning "Repository Git già esistente"
    fi
    
    # Aggiungi tutti i file
    git add .
    
    # Commit iniziale
    git commit -m "Initial commit: IperMoney Lead Generation System" || true
    
    print_success "Repository Git configurato"
}

# Crea .gitignore
create_gitignore() {
    print_status "Creo il file .gitignore..."
    
    cat > /Users/mariobarban/Desktop/ipermoney/.gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/
EOF

    print_success "File .gitignore creato"
}

# Crea file di configurazione per il deployment
create_deployment_configs() {
    print_status "Creo i file di configurazione per il deployment..."
    
    # Crea Procfile per Railway
    cat > /Users/mariobarban/Desktop/ipermoney/backend/Procfile << 'EOF'
web: npm start
EOF

    # Crea package.json per il root (se necessario)
    if [ ! -f "/Users/mariobarban/Desktop/ipermoney/package.json" ]; then
        cat > /Users/mariobarban/Desktop/ipermoney/package.json << 'EOF'
{
  "name": "ipermoney-lead-generation",
  "version": "1.0.0",
  "description": "Sistema completo di gestione lead per POS IperMoney",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "build": "npm run build --prefix backend && npm run build --prefix frontend",
    "start": "npm start --prefix backend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF
    fi

    print_success "File di configurazione creati"
}

# Installa dipendenze
install_dependencies() {
    print_status "Installo le dipendenze..."
    
    # Backend
    cd /Users/mariobarban/Desktop/ipermoney/backend
    npm install
    
    # Frontend
    cd /Users/mariobarban/Desktop/ipermoney/frontend
    npm install
    
    # Root (se necessario)
    cd /Users/mariobarban/Desktop/ipermoney
    if [ -f "package.json" ]; then
        npm install
    fi
    
    print_success "Dipendenze installate"
}

# Crea script di setup per le variabili d'ambiente
create_env_setup() {
    print_status "Creo script per le variabili d'ambiente..."
    
    cat > /Users/mariobarban/Desktop/ipermoney/setup-env.sh << 'EOF'
#!/bin/bash

# Script per configurare le variabili d'ambiente per il deployment

echo "🔧 Configurazione Variabili d'Ambiente per IperMoney Lead Generation"
echo "=================================================================="
echo ""

# Backend Environment
echo "📝 Configurazione Backend (.env):"
echo "Inserisci le seguenti variabili per il backend:"
echo ""

read -p "DATABASE_URL (da Supabase): " DATABASE_URL
read -p "SENDGRID_API_KEY: " SENDGRID_API_KEY
read -p "SENDGRID_FROM_EMAIL (default: contact@firstdigitaltrade.com): " SENDGRID_FROM_EMAIL
SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL:-contact@firstdigitaltrade.com}

read -p "JWT_SECRET (genera una stringa casuale): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "JWT_SECRET generato automaticamente: $JWT_SECRET"
fi

read -p "PORT (default: 4000): " PORT
PORT=${PORT:-4000}

# Crea .env per backend
cat > backend/.env << EOL
DATABASE_URL=$DATABASE_URL
SENDGRID_API_KEY=$SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=$SENDGRID_FROM_EMAIL
JWT_SECRET=$JWT_SECRET
PORT=$PORT
EOL

echo ""
echo "✅ File backend/.env creato"

# Frontend Environment
echo ""
echo "📝 Configurazione Frontend (.env):"
echo ""

read -p "VITE_API_URL (sarà aggiornato dopo il deploy del backend): " VITE_API_URL
read -p "VITE_SUPABASE_URL: " VITE_SUPABASE_URL
read -p "VITE_SUPABASE_ANON_KEY: " VITE_SUPABASE_ANON_KEY

# Crea .env per frontend
cat > frontend/.env << EOL
VITE_API_URL=$VITE_API_URL
VITE_SUPABASE_URL=$VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
EOL

echo ""
echo "✅ File frontend/.env creato"

echo ""
echo "🎉 Configurazione completata!"
echo ""
echo "📋 Prossimi passi:"
echo "1. Esegui: ./deploy.sh"
echo "2. Segui le istruzioni per connettere GitHub"
echo "3. Deploy su Vercel e Railway"
echo ""
EOF

    chmod +x /Users/mariobarban/Desktop/ipermoney/setup-env.sh
    
    print_success "Script di configurazione creato: setup-env.sh"
}

# Crea script per il deployment automatico
create_deploy_script() {
    print_status "Creo script di deployment automatico..."
    
    cat > /Users/mariobarban/Desktop/ipermoney/auto-deploy.sh << 'EOF'
#!/bin/bash

# 🚀 Script di Deploy Automatico per IperMoney Lead Generation
# Questo script automatizza il deployment su Vercel e Railway

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica che le variabili d'ambiente siano configurate
check_env() {
    print_status "Verifico le variabili d'ambiente..."
    
    if [ ! -f "backend/.env" ]; then
        print_error "File backend/.env non trovato. Esegui prima: ./setup-env.sh"
        exit 1
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_error "File frontend/.env non trovato. Esegui prima: ./setup-env.sh"
        exit 1
    fi
    
    print_success "Variabili d'ambiente configurate"
}

# Deploy su Railway
deploy_railway() {
    print_status "Deploy su Railway..."
    
    # Verifica se Railway CLI è installato
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI non installato. Installo..."
        npm install -g @railway/cli
    fi
    
    cd backend
    
    # Login a Railway
    print_status "Login a Railway..."
    railway login
    
    # Crea nuovo progetto
    print_status "Creo nuovo progetto Railway..."
    railway project create ipermoney-backend
    
    # Deploy
    print_status "Deploy in corso..."
    railway up
    
    # Ottieni URL del deployment
    BACKEND_URL=$(railway domain)
    print_success "Backend deployato su: $BACKEND_URL"
    
    # Aggiorna VITE_API_URL
    cd ../frontend
    sed -i.bak "s|VITE_API_URL=.*|VITE_API_URL=$BACKEND_URL|" .env
    print_success "VITE_API_URL aggiornato con: $BACKEND_URL"
    
    cd ..
}

# Deploy su Vercel
deploy_vercel() {
    print_status "Deploy su Vercel..."
    
    # Verifica se Vercel CLI è installato
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI non installato. Installo..."
        npm install -g vercel
    fi
    
    cd frontend
    
    # Login a Vercel
    print_status "Login a Vercel..."
    vercel login
    
    # Deploy
    print_status "Deploy in corso..."
    vercel --prod
    
    # Ottieni URL del deployment
    FRONTEND_URL=$(vercel ls | grep frontend | awk '{print $2}' | head -1)
    print_success "Frontend deployato su: $FRONTEND_URL"
    
    cd ..
}

# Esegui migrazioni del database
run_migrations() {
    print_status "Esegui migrazioni del database..."
    
    cd backend
    npm run migrate
    print_success "Migrazioni completate"
    
    cd ..
}

# Test dell'applicazione
test_application() {
    print_status "Test dell'applicazione..."
    
    # Test backend
    print_status "Test backend..."
    curl -f "$BACKEND_URL/health" || print_warning "Backend non risponde"
    
    # Test frontend
    print_status "Test frontend..."
    curl -f "$FRONTEND_URL" || print_warning "Frontend non risponde"
    
    print_success "Test completati"
}

# Main function
main() {
    echo "🚀 Deploy Automatico IperMoney Lead Generation"
    echo "=============================================="
    echo ""
    
    check_env
    deploy_railway
    deploy_vercel
    run_migrations
    test_application
    
    echo ""
    print_success "🎉 Deploy completato con successo!"
    echo ""
    echo "📋 URL dell'applicazione:"
    echo "Frontend: $FRONTEND_URL"
    echo "Backend: $BACKEND_URL"
    echo ""
    echo "🔧 Per aggiornare le variabili d'ambiente:"
    echo "1. Modifica i file .env"
    echo "2. Esegui: railway variables set KEY=value"
    echo "3. Esegui: vercel env add KEY value"
    echo ""
}

main "$@"
EOF

    chmod +x /Users/mariobarban/Desktop/ipermoney/auto-deploy.sh
    
    print_success "Script di deployment automatico creato: auto-deploy.sh"
}

# Crea documentazione per il deployment
create_deployment_docs() {
    print_status "Creo documentazione per il deployment..."
    
    cat > /Users/mariobarban/Desktop/ipermoney/DEPLOYMENT_GUIDE.md << 'EOF'
# 🚀 Guida al Deployment Automatico

## Prerequisiti
- Node.js 18+
- Git
- Account GitHub
- Account Vercel (gratuito)
- Account Railway (gratuito)
- Account Supabase (già configurato)

## Deploy Rapido

### 1. Configurazione Iniziale
```bash
# Esegui lo script di setup
./deploy.sh
```

### 2. Configura Variabili d'Ambiente
```bash
# Configura le variabili d'ambiente
./setup-env.sh
```

### 3. Deploy Automatico
```bash
# Deploy su Vercel e Railway
./auto-deploy.sh
```

## Deploy Manuale

### 1. GitHub
```bash
# Crea repository su GitHub
# Poi esegui:
git remote add origin https://github.com/tuusuario/ipermoney-lead-generation.git
git push -u origin main
```

### 2. Railway (Backend)
```bash
cd backend
npm install -g @railway/cli
railway login
railway project create ipermoney-backend
railway up
```

### 3. Vercel (Frontend)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## Variabili d'Ambiente

### Backend (Railway)
- `DATABASE_URL`: Stringa di connessione Supabase
- `SENDGRID_API_KEY`: API key SendGrid
- `SENDGRID_FROM_EMAIL`: Email mittente
- `JWT_SECRET`: Chiave segreta JWT
- `PORT`: Porta del server (4000)

### Frontend (Vercel)
- `VITE_API_URL`: URL del backend Railway
- `VITE_SUPABASE_URL`: URL Supabase
- `VITE_SUPABASE_ANON_KEY`: Chiave anonima Supabase

## Troubleshooting

### Backend non si avvia
- Verifica le variabili d'ambiente
- Controlla i log: `railway logs`

### Frontend non si connette
- Verifica `VITE_API_URL`
- Controlla CORS nel backend

### Database non funziona
- Esegui le migrazioni: `npm run migrate`
- Verifica la stringa di connessione

## Supporto
Per problemi tecnici: contact@firstdigitaltrade.com
EOF

    print_success "Documentazione creata: DEPLOYMENT_GUIDE.md"
}

# Main function
main() {
    echo "🚀 Script di Deploy Automatico per IperMoney Lead Generation"
    echo "============================================================"
    echo ""
    
    check_prerequisites
    create_gitignore
    create_deployment_configs
    install_dependencies
    create_env_setup
    create_deploy_script
    create_deployment_docs
    init_git_repo
    
    echo ""
    print_success "🎉 Setup completato!"
    echo ""
    echo "📋 Prossimi passi:"
    echo "1. Esegui: ./setup-env.sh"
    echo "2. Esegui: ./auto-deploy.sh"
    echo ""
    echo "📖 Per maggiori dettagli, leggi: DEPLOYMENT_GUIDE.md"
    echo ""
}

# Esegui main function
main "$@"


