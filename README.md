# Invoice Generator SaaS

AI-powered customizable invoice generator built with MERN stack.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Cache:** Redis
- **AI:** OpenAI API
- **PDF:** Puppeteer
- **Queue:** Bull

## Project Structure

```
Invoice-Maker/
├── frontend/          # React + TypeScript (Vite)
├── backend/           # Node.js + Express + TypeScript
├── docker-compose.yml # For local MongoDB & Redis
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Set up environment variables:**
   - Copy `backend/.env.example` to `backend/.env`
   - Add your MongoDB, Redis, and OpenAI credentials

3. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/v1

## Features

### Free Tier
- 10 invoices/month
- 2 employees
- 3 invoice layouts
- Basic AI generation

### Pro Tier ($29/month)
- 100 invoices/month
- 10 employees
- All 14 layouts
- Custom branding
- Email automation

### Enterprise (Custom pricing)
- Unlimited everything
- White-label option
- SSO support
- Dedicated support

## Development Roadmap

See [task.md](../brain/10242b19-3a9a-49ff-9619-ef2583a3d630/task.md) for detailed implementation checklist.

## License

Proprietary
