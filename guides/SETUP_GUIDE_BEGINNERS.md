# 🚀 Complete Setup Guide - For Beginners
## TuniCompliance Development Environment

> [!NOTE]
> **No prior experience needed!** Just copy-paste commands and follow instructions.

---

## Part 1: What You Actually Need (Explained Simply)

### ✅ **MUST Have** (Can't code without these)
1. **Node.js** = JavaScript runtime (like Java JDK for Java)
2. **Git** = Version control (save your code history)
3. **PostgreSQL** = Database (stores companies, users, obligations)
4. **Code Editor** = VS Code (free, best for TypeScript)

### 🟡 **SHOULD Have** (We'll set up together)
5. **Prisma** = Database tool (easier than raw SQL)
6. **TypeScript** = JavaScript with types (catches errors early)

### 🟢 **NICE to Have** (Skip for now, add later)
7. ~~MinIO~~ → Skip for MVP, use local file storage
8. ~~Sentry~~ → Skip for MVP, add when live
9. ~~Email service~~ → Skip for MVP, logs to console
10. ~~Tunisia hosting~~ → You said local first ✅

---

## Part 2: Step-by-Step Installation

### Step 1: Install Node.js ☑️

**What it is**: JavaScript engine to run backend code.

**Download**: https://nodejs.org (choose LTS version - currently v20)

**Verify installation**:
```bash
node --version
# Should show: v20.x.x
```

---

### Step 2: Install Git ☑️

**What it is**: Saves your code changes like "Ctrl+S on steroids".

**Download**: https://git-scm.com/downloads

**Verify**:
```bash
git --version
# Should show: git version 2.x.x
```

---

### Step 3: Install PostgreSQL ☑️

**What it is**: Database where all data lives.

**Easy option - Docker** (recommended):
```bash
# Install Docker Desktop first: https://www.docker.com/products/docker-desktop

# Then run this ONE command (no complex setup):
docker run -d \
  --name tunicompliance-db \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_USER=tuniuser \
  -e POSTGRES_DB=tunicompliance \
  -p 5432:5432 \
  postgres:15
```

**Manual option**: https://www.postgresql.org/download/windows/

**Verify**:
```bash
# If using Docker:
docker ps
# Should show container running

# Test connection:
psql -h localhost -U tuniuser -d tunicompliance
# Password: dev123
```

---

### Step 4: Install VS Code ☑️

**Download**: https://code.visualstudio.com/

**Recommended extensions** (install from VS Code):
- ESLint
- Prettier
- Prisma
- GitLens

---

## Part 3: Create Project Structure (One Command!)

### Copy this script - it creates EVERYTHING:

```powershell
# Create project folder
New-Item -ItemType Directory -Path "M:\dev\comply\tunicompliance" -Force
Set-Location "M:\dev\comply\tunicompliance"

# Create backend structure
New-Item -ItemType Directory -Path "backend\src\modules\companies" -Force
New-Item -ItemType Directory -Path "backend\src\modules\users" -Force
New-Item -ItemType Directory -Path "backend\src\modules\obligations" -Force
New-Item -ItemType Directory -Path "backend\src\modules\controls" -Force
New-Item -ItemType Directory -Path "backend\src\modules\checks" -Force
New-Item -ItemType Directory -Path "backend\src\modules\evidence" -Force
New-Item -ItemType Directory -Path "backend\src\modules\deadlines" -Force
New-Item -ItemType Directory -Path "backend\src\modules\alerts" -Force
New-Item -ItemType Directory -Path "backend\src\modules\scoring" -Force
New-Item -ItemType Directory -Path "backend\src\shared" -Force
New-Item -ItemType Directory -Path "backend\src\jobs" -Force
New-Item -ItemType Directory -Path "backend\prisma\seeds" -Force
New-Item -ItemType Directory -Path "backend\tests" -Force

# Create frontend structure
New-Item -ItemType Directory -Path "frontend\src\components" -Force
New-Item -ItemType Directory -Path "frontend\src\pages" -Force
New-Item -ItemType Directory -Path "frontend\src\i18n\locales\fr" -Force
New-Item -ItemType Directory -Path "frontend\src\i18n\locales\ar" -Force
New-Item -ItemType Directory -Path "frontend\src\utils" -Force
New-Item -ItemType Directory -Path "frontend\src\services" -Force

# Create docs folder (copy your existing docs here)
New-Item -ItemType Directory -Path "docs" -Force

Write-Host "✅ Project structure created!"
```

**Run it in PowerShell** (Windows) or adapt for Bash (Linux/Mac).

---

## Part 4: Initialize Backend

### Step 1: Create package.json

```bash
cd backend
npm init -y
```

This creates `package.json` (like a shopping list of what your project needs).

---

### Step 2: Install Dependencies

**Copy-paste this ONE command**:
```bash
npm install fastify @fastify/cors @fastify/jwt prisma @prisma/client bcrypt zod pino dotenv

npm install -D typescript @types/node @types/bcrypt vitest prisma tsx nodemon
```

**What each does** (just FYI, you don't need to understand now):
- `fastify` = Web server (like Express but faster)
- `prisma` = Database tool (makes SQL easy)
- `bcrypt` = Password encryption
- `zod` = Validation (checks if Tax ID is correct format)
- `typescript` = Code safety
- `vitest` = Testing tool
- `tsx` = Run TypeScript directly

---

### Step 3: Create tsconfig.json

**File**: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**What it does**: Tells TypeScript how to compile your code (like compiler settings).

---

### Step 4: Create .env.example

**File**: `backend/.env.example`

```env
# Database
DATABASE_URL="postgresql://tuniuser:dev123@localhost:5432/tunicompliance"

# JWT Authentication
JWT_SECRET="your-super-secret-key-change-this-in-production-256-bits"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# App
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# File Storage (MVP - local)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Email (MVP - disabled, logs to console)
EMAIL_ENABLED=false
```

**What it does**: Stores secrets and config (like API keys). **NEVER commit this to Git!**

---

### Step 5: Copy to real .env

```bash
cp .env.example .env
```

**Generate real JWT secret**:
```bash
# In Node.js console:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output and replace `JWT_SECRET` in `.env`.

---

### Step 6: Create .gitignore

**File**: `backend/.gitignore`

```
node_modules/
dist/
.env
uploads/
*.log
.DS_Store
```

**What it does**: Tells Git "don't save these files" (like node_modules, secrets).

---

### Step 7: Update package.json scripts

**File**: `backend/package.json` - add this `scripts` section:

```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "tsx prisma/seeds/index.ts",
    "db:studio": "prisma studio"
  }
}
```

**What each does**:
- `npm run dev` = Start server (with auto-reload)
- `npm run db:studio` = Visual database browser (super useful!)
- `npm test` = Run tests

---

## Part 5: Initialize Frontend (React)

### Option A: Vite (Recommended - faster)

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
```

Answer prompts:
- Package name: `tunicompliance-frontend`
- Framework: `React`
- Variant: `TypeScript`

---

### Option B: Create React App (Easier for beginners)

```bash
cd ../frontend
npx create-react-app . --template typescript
```

---

### Install Frontend Dependencies

```bash
npm install react-i18next i18next i18next-browser-languagedetector
npm install react-router-dom
npm install axios
npm install date-fns
```

**What each does**:
- `react-i18next` = Translations (FR/AR)
- `react-router-dom` = Page navigation
- `axios` = Talk to backend API
- `date-fns` = Format dates

---

## Part 6: Prisma Setup (Database Magic)

### Step 1: Initialize Prisma

```bash
cd backend
npx prisma init
```

This creates `prisma/schema.prisma`.

---

### Step 2: I'll create the full schema for you

**File**: `backend/prisma/schema.prisma`

(I'll create this in next message - it's the DATA_MODEL_V2.md translated)

---

## Part 7: What We're SKIPPING for MVP

| Item | Why Skip | When to Add |
|------|----------|-------------|
| **MinIO** | Use local file storage | Phase 2 (when 100+ companies) |
| **Sentry** | Use console.log errors | After launch (when debugging prod) |
| **Email service** | Log emails to console | Week 6 (when testing alerts) |
| **CI/CD pipeline** | Deploy manually | After Week 4 (when stable) |
| **Playwright E2E** | Manual testing is enough | Phase 2 (when critical bugs caught) |
| **Swagger/OpenAPI** | Postman is simpler | Phase 2 (when API is stable) |

**We focus on: Write code → Test locally → Deploy later**

---

## Part 8: Your Setup Checklist

### Now (Next 1 hour):
- [ ] Install Node.js
- [ ] Install Git
- [ ] Install PostgreSQL (Docker)
- [ ] Install VS Code
- [ ] Run project structure script
- [ ] Initialize backend (npm commands above)
- [ ] Initialize frontend (Vite)

### Tomorrow:
- [ ] I'll give you Prisma schema (database)
- [ ] We'll create first entity (Company)
- [ ] Test with Prisma Studio (visual DB)

### Week 1:
- [ ] Company module working
- [ ] User authentication working
- [ ] You can login via API

---

## Part 9: Quick Reference

### Essential Commands

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev

# View database
cd backend
npm run db:studio

# Run tests
npm test
```

---

## Part 10: Troubleshooting

### "Command not found: npm"
→ Node.js not installed or not in PATH. Reinstall Node.js.

### "Port 3000 already in use"
→ Another app running. Change `PORT=3001` in `.env`

### "Can't connect to database"
→ Check Docker: `docker ps` - is container running?

---

## 🎯 Your Next Step

**Tell me when you've:**
1. Installed Node.js + Git + PostgreSQL (Docker or manual)
2. Run the project structure script
3. Initialized backend (`npm init` + installed dependencies)

**Then I'll give you:**
- Complete Prisma schema (database structure)
- First working API endpoint
- Step-by-step guide to test it

---

**Questions?**
- "What's the difference between npm and npx?"
- "Do I really need TypeScript or can I use JavaScript?"
- "Can I use MySQL instead of PostgreSQL?"

Just ask! 😊
