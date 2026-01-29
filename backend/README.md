# TuniCompliance Backend

Compliance & Regulation Monitoring API for Tunisian SMEs

## Quick Start

### 1. Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE complytn;

-- Exit
\q
```

### 2. Run Migrations

```powershell
npm run db:push
```

This creates all tables from `schema.prisma`.

### 3. Start Development Server

```powershell
npm run dev
```

Server runs on http://localhost:3000

### 4. View Database

```powershell
npm run db:studio
```

Opens Prisma Studio (visual database browser) on http://localhost:5555

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (auto-reload) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm test` | Run tests |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:migrate` | Create migration |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

Copy `.env.example` to `.env` and update values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/complytn"
JWT_SECRET="your-secret-key"
PORT=3000
```

## Database Schema

See `prisma/schema.prisma` for complete data model.

**Main entities:**
- 🏢 **Company** - Multi-tenant root
- 👤 **User** - Authentication & roles
- 📜 **Regulation** - Tunisia regulatory framework
- ⚠️ **Obligation** - Compliance requirements
- ✅ **Control** - What must exist
- 🔍 **Check** - Inspection events
- 📁 **Evidence** - Proof files
- 📅 **Deadline** - Due dates
- 🔔 **Alert** - Notifications
- 🎯 **Audit** - External audits (BSCI, Disney, etc.)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 5
- **Language**: TypeScript 5
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7
- **Auth**: JWT
- **Validation**: Zod
- **Testing**: Vitest

## Architecture

Modular monolith organized by domain:

```
src/
├── modules/
│   ├── companies/
│   ├── users/
│   ├── obligations/
│   ├── controls/
│   ├── checks/
│   ├── evidence/
│   ├── deadlines/
│   ├── alerts/
│   └── scoring/
├── shared/
│   ├── errors.ts
│   ├── validators.ts
│   └── types.ts
└── server.ts
```

## Development Workflow

1. **Make schema changes** in `schema.prisma`
2. **Push to DB**: `npm run db:push`  
3. **Generate client**: `npm run db:generate`
4. **Write code** in `src/modules/`
5. **Test**: `npm test`
6. **Run**: `npm run dev`

## Troubleshooting

### "Can't connect to database"
```powershell
# Check PostgreSQL is running
psql -U postgres -d complytn

# If not, start PostgreSQL service
```

### "Prisma Client not generated"
```powershell
npm run db:generate
```

### "Port 3000 already in use"
Change `PORT=3001` in `.env`

## Documentation

See `/guides` folder for:
- Architecture documentation
- Data model specifications
- API guidelines
- Tunisia compliance reference

## License

Proprietary
