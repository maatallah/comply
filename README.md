# TuniCompliance

Compliance & Regulation Monitoring SaaS for Tunisian SMEs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/tunicompliance.git
cd tunicompliance

# Backend setup
cd backend
npm install
cp .env.example .env  # Edit with your database credentials
npm run db:push
npm run db:seed
npm run dev

# Server runs on http://localhost:3000
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register company + admin |
| POST | /auth/login | Login, get JWT token |
| GET | /auth/me | Current user (protected) |
| GET | /companies | List companies |
| POST | /companies | Create company |
| GET | /regulations | List regulations |
| GET | /users | List users (protected) |

## 📁 Project Structure

```
tunicompliance/
├── backend/           # Fastify + TypeScript API
│   ├── src/
│   │   ├── modules/   # Feature modules
│   │   └── shared/    # Common utilities
│   └── prisma/        # Database schema & seeds
├── frontend/          # React (coming soon)
└── guides/            # Architecture documentation
```

## 🛠 Tech Stack

- **Backend**: Fastify, TypeScript, Prisma
- **Database**: PostgreSQL
- **Auth**: JWT (bcrypt)
- **Validation**: Zod

## 📜 Regulations Covered (Tier 1)

1. BSCI Social Audit
2. Fire Safety (Protection Civile)
3. Electrical Safety
4. CNSS Declarations
5. TVA Fiscale
6. Médecine du Travail
7. Hazardous Waste (ANGED)
8. Work Contracts

## 📋 Development

```bash
npm run dev          # Start dev server
npm run db:studio    # Visual database browser
npm run db:seed      # Seed regulations
npm test             # Run tests
```

## License

Proprietary
