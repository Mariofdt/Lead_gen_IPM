#!/bin/bash

# 🐳 Deploy con Docker per IperMoney Lead Generation
# Script per deployment con Docker Compose

set -e

# Colori
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🐳 Deploy con Docker per IperMoney Lead Generation${NC}"
echo "======================================================"
echo ""

# Verifica Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non installato"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose non installato"
    exit 1
fi

echo "✅ Docker OK"
echo ""

# Crea Dockerfile per backend
echo -e "${BLUE}📝 Creo Dockerfile per backend...${NC}"
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production

# Copia il codice sorgente
COPY . .

# Compila TypeScript
RUN npm run build

# Esponi la porta
EXPOSE 4000

# Comando di avvio
CMD ["npm", "start"]
EOF

# Crea Dockerfile per frontend
echo -e "${BLUE}📝 Creo Dockerfile per frontend...${NC}"
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine as builder

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Stage di produzione con nginx
FROM nginx:alpine

# Copia i file buildati
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configurazione nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Esponi la porta
EXPOSE 80

# Comando di avvio
CMD ["nginx", "-g", "daemon off;"]
EOF

# Crea nginx.conf per frontend
cat > frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Crea docker-compose.yml
echo -e "${BLUE}📝 Creo docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}
      - JWT_SECRET=${JWT_SECRET}
      - PORT=4000
    depends_on:
      - db
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ipermoney
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
EOF

# Crea .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/ipermoney

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=contact@firstdigitaltrade.com

# JWT
JWT_SECRET=your_jwt_secret_here
EOF

echo "✅ File Docker creati"
echo ""

# Istruzioni per il deployment
echo -e "${GREEN}🎉 Setup Docker completato!${NC}"
echo ""
echo -e "${YELLOW}📋 Per avviare l'applicazione:${NC}"
echo ""
echo "1. 📝 Configura le variabili d'ambiente:"
echo "   cp .env.example .env"
echo "   # Modifica .env con i tuoi valori"
echo ""
echo "2. 🚀 Avvia l'applicazione:"
echo "   docker-compose up --build"
echo ""
echo "3. 🌐 Accedi all'applicazione:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:4000"
echo "   Database: localhost:5432"
echo ""
echo "4. 🛑 Ferma l'applicazione:"
echo "   docker-compose down"
echo ""
echo "5. 🗄️ Esegui migrazioni database:"
echo "   docker-compose exec backend npm run migrate"
echo ""
echo -e "${GREEN}🎯 L'applicazione sarà disponibile localmente!${NC}"


