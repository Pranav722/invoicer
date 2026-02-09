# Invoice SaaS Backend API

## 🎯 Complete REST API - 100% FREE Tier

Backend API for invoice management system with **authentication, vendors, services, invoices, payments, AI features, and email notifications** - all running on FREE services!

---

## 🚀 Features Implemented

### ✅ **Complete Modules**

1. **Authentication Module**
   - User registration with company creation
   - Login with JWT tokens
   - Refresh token mechanism
   - Role-based access control (Owner, Admin, User, Viewer)
   - Multi-tenant isolation

2. **Vendor Management**
   - CRUD operations
   - Pagination and filtering
   - Search functionality
   - Soft delete

3. **Service Management**
   - CRUD operations
   - Category organization
   - Default rates and units

4. **Invoice Generation**
   - Create invoices with line items
   - Auto-calculate subtotals, taxes, totals
   - 14 professional templates
   - PDF generation
   - Email sending (FREE with Resend)
   - AI content generation (FREE with Gemini)
   - Status workflow (draft→sent→paid)
   - Invoice numbering system

5. **Payment Tracking**
   - Record payments
   - Auto-update invoice amounts
   - Payment history
   - Analytics and summaries
   - Transaction support

6. **AI Features** (100% FREE!)
   - Header/footer text generation
   - Design recommendations
   - Formatting suggestions
   - Amount-to-words conversion
   - Uses Google Gemini API (FREE tier: 1M tokens/day)

---

## 📦 Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js + TypeScript
- **Database:** MongoDB Atlas (FREE: 512MB)
- **AI:** Google Gemini API (FREE: 1M tokens/day)
- **Email:** Resend (FREE: 3,000 emails/month)
- **Auth:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** helmet, cors, bcrypt

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create `.env` file:

```env
# Database (MongoDB Atlas FREE tier)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoice-saas

# AI Service (Google Gemini API - FREE!)
GEMINI_API_KEY=your_gemini_api_key_here

# Email Service (Resend - 3,000 emails/month FREE!)
RESEND_API_KEY=re_your_resend_key_here
EMAIL_FROM=Invoice SaaS <onboarding@resend.dev>

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Redis (Optional - for caching)
# UPSTASH_REDIS_URL=your-redis-url
# UPSTASH_REDIS_TOKEN=your-redis-token
```

### 3. Get FREE API Keys

**MongoDB Atlas** (FREE 512MB):
1. Go to mongodb.com/cloud/atlas
2. Sign up and create M0 FREE cluster
3. Get connection string

**Google Gemini API** (FREE 1M tokens/day):
1. Go to ai.google.dev
2. Click "Get API Key"
3. Copy API key (no credit card needed!)

**Resend Email** (FREE 3,000/month):
1. Go to resend.com
2. Sign up and get API key
3. Use default sender: `onboarding@resend.dev`

### 4. Run Development Server

```bash
npm run dev
```

Server starts on `http://localhost:5000`

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📚 API Endpoints

### **Authentication**
- `POST /api/v1/auth/register` - Register new company
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### **Vendors**
- `GET /api/v1/vendors` - List vendors
- `GET /api/v1/vendors/:id` - Get vendor
- `POST /api/v1/vendors` - Create vendor
- `PUT /api/v1/vendors/:id` - Update vendor
- `DELETE /api/v1/vendors/:id` - Delete vendor

### **Services**
- `GET /api/v1/services` - List services
- `GET /api/v1/services/:id` - Get service
- `POST /api/v1/services` - Create service
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Delete service

### **Invoices**
- `GET /api/v1/invoices` - List invoices
- `GET /api/v1/invoices/:id` - Get invoice
- `POST /api/v1/invoices` - Create invoice
- `PATCH /api/v1/invoices/:id` - Update invoice
- `DELETE /api/v1/invoices/:id` - Delete invoice
- `PATCH /api/v1/invoices/:id/status` - Update status
- `POST /api/v1/invoices/:id/send` - **Send email** 📧
- `POST /api/v1/invoices/:id/pdf` - Generate PDF
- `GET /api/v1/invoices/:id/pdf/download` - Download PDF
- `POST /api/v1/invoices/:id/duplicate` - Duplicate invoice
- `GET /api/v1/invoices/templates` - **Get 14 templates** 🎨
- `GET /api/v1/invoices/stats` - Dashboard stats

### **Payments** 💰
- `POST /api/v1/invoices/:id/payments` - Record payment
- `GET /api/v1/invoices/:id/payments` - List invoice payments
- `GET /api/v1/payments` - List all payments
- `DELETE /api/v1/payments/:id` - Delete payment

### **AI Features** 🤖 (FREE!)
- `POST /api/v1/ai/generate-text` - Generate header/footer
- `POST /api/v1/ai/design-recommendations` - Get template suggestions
- `POST /api/v1/ai/formatting-suggestions` - Get formatting tips
- `POST /api/v1/ai/amount-to-words` - Convert amount (FREE, deterministic)
- `GET /api/v1/ai/cost-stats` - View usage stats ($0!)

---

## 🔐 Authorization Matrix

| Endpoint | Owner | Admin | User | Viewer |
|----------|-------|-------|------|--------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Vendors - List/Get | ✅ | ✅ | ✅ | ✅ |
| Vendors - Create/Update | ✅ | ✅ | ✅ | ❌ |
| Vendors - Delete | ✅ | ✅ | ❌ | ❌ |
| Services - List/Get | ✅ | ✅ | ✅ | ✅ |
| Services - Create/Update/Delete | ✅ | ✅ | ❌ | ❌ |
| Invoices - List/Get | ✅ | ✅ | ✅ | ✅ |
| Invoices - Create/Update/Send | ✅ | ✅ | ✅ | ❌ |
| Invoices - Delete | ✅ | ✅ | ❌ | ❌ |
| Payments - List/Get | ✅ | ✅ | ✅ | ✅ |
| Payments - Create | ✅ | ✅ | ✅ | ❌ |
| Payments - Delete | ✅ | ✅ | ❌ | ❌ |
| AI Features | ✅ | ✅ | ✅ | ❌ |

---

## 📊 Database Models

### **User**
- email, password (hashed)
- role: owner | admin | user | viewer
- profile: firstName, lastName
- companyId (multi-tenant)

### **Tenant (Company)**
- name, email, phone, address
- settings (invoiceNumberPrefix, etc.)
- subscription tier

### **Vendor**
- companyName, contactPerson
- email, phone, address
- taxId, paymentTerms

### **Service**
- name, description
- defaultRate, unit
- category, taxable

### **Invoice**
- invoiceNumber, status
- vendorSnapshot (data at creation time)
- lineItems (description, qty, rate, amount)
- subtotal, taxAmount, totalAmount
- amountPaid, amountDue
- issueDate, dueDate, currency

### **Payment** 💰
- invoiceId, tenantId
- amount, paymentDate
- paymentMethod (bank_transfer, credit_card, check, cash, other)
- referenceNumber, notes
- recordedBy (user)

---

## 🎨 Invoice Templates

14 professional templates available:
1. Classic Professional
2. Modern Minimal
3. Bold Statement
4. Sidebar Layout
5. Compact Executive
6. Creative Agency
7. Split Screen
8. Top Heavy
9. Grid Mastery
10. Minimalist Luxury
11. Data Dense
12. Floating Boxes
13. Timeline Style
14. Professional Certificate

Access via `GET /api/v1/invoices/templates`

---

## 💰 Cost Breakdown

**Monthly Costs: $0** 🎉

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 512MB storage | $0 |
| Google Gemini API | 1M tokens/day | $0 |
| Resend Email | 3,000 emails/month | $0 |
| Railway Hosting | 500 hours/month | $0 |
| **TOTAL** | | **$0/month** |

**Supports:**
- ~1,000 invoices/month
- ~100 active users
- Full AI features
- Email notifications

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!",
    "profile": {
      "firstName": "John",
      "lastName": " Doe"
    },
    "companyName": "Acme Corp"
  }'
```

### Create Invoice
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "VENDOR_ID",
    "lineItems": [
      {
        "description": "Web Development",
        "quantity": 20,
        "rate": 150
      }
    ],
    "taxRate": 8.0
  }'
```

---

## 🚀 Deployment

See [deployment_walkthrough_free.md](../../../deployment_walkthrough_free.md) for complete deployment guide using:
- **Railway** (backend - FREE)
- **Vercel** (frontend - FREE)
- **MongoDB Atlas** (database - FREE)

---

## 📝 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   └── redis.ts           # Redis (optional)
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── vendorController.ts
│   │   ├── serviceController.ts
│   │   ├── invoiceController.ts
│   │   ├── invoiceEmailController.ts  # Email sending
│   │   ├── paymentController.ts       # NEW! 💰
│   │   ├── userController.ts
│   │   └── tenantController.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT auth + RBAC
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Tenant.ts
│   │   ├── Vendor.ts
│   │   ├── Service.ts
│   │   ├── Invoice.ts
│   │   └── Payment.ts         # NEW! 💰
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── vendorRoutes.ts
│   │   ├── serviceRoutes.ts
│   │   ├── invoiceRoutes.ts
│   │   ├── paymentRoutes.ts   # NEW! 💰
│   │   ├── aiRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── tenantRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── ai/
│   │   │   └── GeminiAIService.ts     # FREE AI! 🤖
│   │   ├── email/
│   │   │   └── ResendEmailService.ts  # FREE Email! 📧
│   │   └── pdfService.ts
│   ├── utils/
│   │   ├── amountToWords.ts   # FREE conversion!
│   │   └── logger.ts
│   ├── server.ts              # Express app
│   └── index.ts               # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md (this file)
```

---

## ✅ Implementation Status

### **Completed** ✅
- ✅ All 6 database models
- ✅ All 7 controllers
- ✅ All 8 route modules
- ✅ Payment tracking with transactions
- ✅ Invoice email sending (Resend)
- ✅ AI features (Gemini API)
- ✅ Multi-tenant architecture
- ✅ RBAC (4 roles)
- ✅ PDF generation
- ✅ Amount-to-words converter
- ✅ 14 invoice templates
- ✅ Error handling
- ✅ Request validation
- ✅ Security (helmet, cors)
- ✅ Rate limiting

### **Optional Enhancements** ⚠️
- ⚠️ Unit tests (Jest)
- ⚠️ API documentation (Swagger)
- ⚠️ File upload for logos
- ⚠️ Recurring invoices
- ⚠️ Email reminders (cron jobs)

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/dbname

# Verify IP whitelist (set to 0.0.0.0/0)
```

### Gemini API Error
```bash
# Verify API key is correct
# Check quota at ai.google.dev
# Rate limit: 15 req/min
```

### Email Not Sending
```bash
# Verify Resend API key
# Check sender email (onboarding@resend.dev works immediately)
# Monthly limit: 3,000 emails
```

---

## 📚 Documentation

- [API Specification](../../../api_specification.md) - Complete API docs
- [Free Tier Architecture](../../../free_tier_architecture.md) - All FREE services
- [Deployment Guide](../../../deployment_walkthrough_free.md) - Step-by-step deployment

---

## 🎉 Ready to Go!

The backend is **fully implemented** with:
- ✅ **30+ API endpoints**
- ✅ **Payment tracking** with automatic invoice updates
- ✅ **Email sending** with professional templates
- ✅ **AI features** using FREE Gemini API
- ✅ **100% free** - supports ~1,000 invoices/month!

**Start the server:**
```bash
npm run dev
```

**Health check:**
```bash
curl http://localhost:5000/health
```

**Total monthly cost: $0** 💰

---

Made with ❤️ using 100% FREE services!
