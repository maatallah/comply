# TuniCompliance Project Setup Script
# Run this in PowerShell (Windows)

Write-Host "🚀 Setting up TuniCompliance project..." -ForegroundColor Green

# Create root directory
$rootPath = "M:\dev\comply\tunicompliance"
New-Item -ItemType Directory -Path $rootPath -Force | Out-Null
Set-Location $rootPath

Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow

# Backend directories
$backendDirs = @(
    "backend\src\modules\companies",
    "backend\src\modules\users",
    "backend\src\modules\obligations",
    "backend\src\modules\controls",
    "backend\src\modules\checks",
    "backend\src\modules\evidence",
    "backend\src\modules\deadlines",
    "backend\src\modules\alerts",
    "backend\src\modules\scoring",
    "backend\src\modules\audits",
    "backend\src\shared",
    "backend\src\jobs",
    "backend\prisma\seeds",
    "backend\tests\unit",
    "backend\tests\integration",
    "backend\uploads"
)

foreach ($dir in $backendDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Frontend directories
$frontendDirs = @(
    "frontend\src\components\common",
    "frontend\src\components\layout",
    "frontend\src\pages",
    "frontend\src\i18n\locales\fr",
    "frontend\src\i18n\locales\ar",
    "frontend\src\utils",
    "frontend\src\services",
    "frontend\src\hooks",
    "frontend\src\contexts",
    "frontend\src\types",
    "frontend\public"
)

foreach ($dir in $frontendDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Docs directory
New-Item -ItemType Directory -Path "docs" -Force | Out-Null

Write-Host "✅ Directory structure created!" -ForegroundColor Green

# Create .gitignore at root
$gitignoreContent = @"
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
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent

Write-Host "✅ Created .gitignore" -ForegroundColor Green

# Create README.md
$readmeContent = @"
# TuniCompliance

Compliance & Regulation Monitoring SaaS for Tunisian SMEs

## Quick Start

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Database
\`\`\`bash
# Start PostgreSQL (Docker)
docker run -d --name tunicompliance-db -e POSTGRES_PASSWORD=dev123 -e POSTGRES_USER=tuniuser -e POSTGRES_DB=tunicompliance -p 5432:5432 postgres:15

# Run migrations
cd backend
npm run db:migrate

# View database
npm run db:studio
\`\`\`

## Architecture

See \`docs/\` folder for complete architecture documentation.

## Tech Stack

- **Backend**: Fastify + TypeScript + Prisma
- **Frontend**: React 18 + TypeScript + i18next
- **Database**: PostgreSQL 15
- **Auth**: JWT

## License

Proprietary
"@

Set-Content -Path "README.md" -Value $readmeContent

Write-Host "✅ Created README.md" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd backend" -ForegroundColor Cyan
Write-Host "2. npm init -y" -ForegroundColor Cyan
Write-Host "3. Follow SETUP_GUIDE_BEGINNERS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project location: $rootPath" -ForegroundColor White
