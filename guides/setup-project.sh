#!/bin/bash
# TuniCompliance Project Setup Script (Linux/Mac)

echo "🚀 Setting up TuniCompliance project..."

# Create root directory
ROOT_PATH="$HOME/projects/tunicompliance"
mkdir -p "$ROOT_PATH"
cd "$ROOT_PATH"

echo "📁 Creating directory structure..."

# Backend directories
mkdir -p backend/src/modules/{companies,users,obligations,controls,checks,evidence,deadlines,alerts,scoring,audits}
mkdir -p backend/src/{shared,jobs}
mkdir -p backend/prisma/seeds
mkdir -p backend/tests/{unit,integration}
mkdir -p backend/uploads

# Frontend directories
mkdir -p frontend/src/components/{common,layout}
mkdir -p frontend/src/{pages,utils,services,hooks,contexts,types}
mkdir -p frontend/src/i18n/locales/{fr,ar}
mkdir -p frontend/public

# Docs directory
mkdir -p docs

echo "✅ Directory structure created!"

# Create .gitignore at root
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/
backend/uploads/

# Database
*.db
*.sqlite
EOF

echo "✅ Created .gitignore"

# Create README.md
cat > README.md << 'EOF'
# TuniCompliance

Compliance & Regulation Monitoring SaaS for Tunisian SMEs

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
```bash
# Start PostgreSQL (Docker)
docker run -d --name tunicompliance-db \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_USER=tuniuser \
  -e POSTGRES_DB=tunicompliance \
  -p 5432:5432 \
  postgres:15

# Run migrations
cd backend
npm run db:migrate

# View database
npm run db:studio
```

## Architecture

See `docs/` folder for complete architecture documentation.

## Tech Stack

- **Backend**: Fastify + TypeScript + Prisma
- **Frontend**: React 18 + TypeScript + i18next
- **Database**: PostgreSQL 15
- **Auth**: JWT

## License

Proprietary
EOF

echo "✅ Created README.md"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. npm init -y"
echo "3. Follow SETUP_GUIDE_BEGINNERS.md"
echo ""
echo "Project location: $ROOT_PATH"
