# TECHNICAL DESIGN DOCUMENT
## EcoShop – AI-Powered Eco-Friendly Product Finder

**Version:** 1.0  
**Date:** October 2026  
**Institution:** Sri Sairam Engineering College, Chennai  
**Department:** Computer Science and Engineering  
**Team:** Rahul R K (412422104085), Dinesh Kumar A (412422104032), Agneeshwar P (412422104008)  
**Guide:** Ms. Midhunadharshni G, Assistant Professor

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Component Design](#3-component-design)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [AI / ML Pipeline](#6-ai--ml-pipeline)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Security Design](#8-security-design)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Data Flow Diagrams](#10-data-flow-diagrams)

---

## 1. System Overview

EcoShop is a full-stack AI-powered e-commerce web application built using Next.js 16 (App Router), Prisma ORM, and Neon Serverless PostgreSQL. The platform allows users to discover eco-friendly products via traditional browsing OR by photographing any product and letting an on-device AI (TensorFlow.js MobileNet) classify it and find certified green alternatives.

### Design Goals

| Goal | Decision |
|------|----------|
| Zero GPU inference cost | Client-side MobileNet (browser WebGL) |
| Serverless scalability | Neon PostgreSQL + Vercel Edge Functions |
| Type safety | TypeScript + Prisma generated types |
| Fast UI | Next.js App Router + React Server Components |
| Mobile-first | Tailwind CSS responsive utilities |
| Privacy | No user images sent to server; inference is local |

---

## 2. Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════╗
║                        CLIENT (Browser)                              ║
║                                                                      ║
║   ┌──────────────────────────────────────────────────────────────┐   ║
║   │               Next.js 16 App Router (React)                  │   ║
║   │                                                              │   ║
║   │   ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │   ║
║   │   │  /store    │  │  /scanner    │  │ /product/[slug]   │   │   ║
║   │   │  (Catalog) │  │  (AI Scan)   │  │ (Product Detail)  │   │   ║
║   │   └─────┬──────┘  └──────┬───────┘  └────────┬──────────┘   │   ║
║   │         │                │                    │              │   ║
║   │   ┌─────▼──────────────────────────────────────▼──────────┐  │   ║
║   │   │              Shared Components                         │  │   ║
║   │   │  NavBar │ ProductCard │ AuthSplash │ ChatDrawer        │  │   ║
║   │   └─────────────────────────────────────────────────────┬─┘  │   ║
║   │                                                         │    │   ║
║   │   ┌──────────────────────────┐                          │    │   ║
║   │   │   TensorFlow.js Engine   │◄─── WebGL Acceleration   │    │   ║
║   │   │   MobileNet v1 (Quant.)  │                          │    │   ║
║   │   │   Keyword Normalizer     │                          │    │   ║
║   │   └──────────┬───────────────┘                          │    │   ║
║   └──────────────┼───────────────────────────────────────────┘   ║
║                  │ fetch() HTTPS API calls                        ║
╚══════════════════╪═══════════════════════════════════════════════╝
                   │
╔══════════════════▼═══════════════════════════════════════════════╗
║              VERCEL EDGE (Serverless Functions)                   ║
║                                                                   ║
║   ┌─────────────────────┐  ┌────────────────────────────────┐    ║
║   │  GET /api/products  │  │  GET /api/products/[slug]      │    ║
║   │  POST /api/eco-score│  │  POST /api/chat                │    ║
║   └──────────┬──────────┘  └───────────────┬────────────────┘    ║
║              │                             │                      ║
║   ┌──────────▼─────────────────────────────▼────────────────┐    ║
║   │                    Prisma ORM Client                     │    ║
║   │         (Type-safe database query builder)               │    ║
║   └──────────────────────────┬───────────────────────────────┘    ║
╚═════════════════════════════╪════════════════════════════════════╝
                              │ SSL / TLS
╔═════════════════════════════▼════════════════════════════════════╗
║                  NEON SERVERLESS POSTGRESQL                       ║
║                                                                   ║
║   ┌──────────────┐  ┌─────────┐  ┌──────────┐  ┌────────────┐   ║
║   │   Product    │  │  User   │  │  Order   │  │  CartItem  │   ║
║   │   (10 rows)  │  │ (users) │  │ (orders) │  │            │   ║
║   └──────────────┘  └─────────┘  └──────────┘  └────────────┘   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 3. Component Design

### 3.1 Frontend Components

#### NavBar (`src/components/store/NavBar.tsx`)
- **Purpose:** Top navigation with logo, search bar, cart icon, and auth trigger
- **State:** Cart count (local state), user session (context)
- **Props:** None (reads from context)

#### ProductCard (`src/components/store/ProductCard.tsx`)
- **Purpose:** Displays individual product in grid view
- **Props:** `product: Product`, `onAddToCart: () => void`
- **Features:** EcoScore badge, rating stars, price in ₹, hover animation

#### AuthSplash (`src/components/auth/AuthSplash.tsx`)
- **Purpose:** Full-screen overlay for login / register
- **State:** `mode: 'login' | 'register'`, form fields, error messages
- **Events:** `onSuccess()` callback closes modal

#### ChatDrawer (`src/components/chatbot/ChatDrawer.tsx`)
- **Purpose:** Slide-in AI chatbot powered by Gemini API
- **State:** Message history array, loading state
- **API:** Calls `POST /api/chat` with conversation context

### 3.2 Page Components

| Page | File | Purpose |
|------|------|---------|
| Home | `src/app/page.tsx` | Hero section, featured products |
| Store | `src/app/store/page.tsx` | Full product catalog with filters |
| Scanner | `src/app/scanner/page.tsx` | AI image classification + results |
| Product | `src/app/product/[slug]/page.tsx` | Detailed product view |

### 3.3 API Route Handlers

| Route | Method | Handler File |
|-------|--------|-------------|
| `/api/products` | GET | `src/app/api/products/route.ts` |
| `/api/products/[slug]` | GET | `src/app/api/products/[slug]/route.ts` |
| `/api/eco-score` | POST | `src/app/api/eco-score/route.ts` |
| `/api/chat` | POST | `src/app/api/chat/route.ts` |

---

## 4. Database Schema

### Entity-Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│    Product   │         │     User     │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ name         │         │ email        │
│ slug (unique)│         │ password     │
│ price        │         │ createdAt    │
│ rating       │         └──────┬───────┘
│ reviews      │                │ 1
│ ecoScore     │                │
│ description  │         ┌──────▼───────┐
│ category     │         │   CartItem   │
│ material     │    1:N  ├──────────────┤
│ imageUrl     ├─────────┤ id (PK)      │
│ stock        │         │ productId FK │
│ featured     │         │ userId FK    │
│ createdAt    │         │ quantity     │
│ updatedAt    │         └──────────────┘
└──────┬───────┘
       │ 1:N          ┌──────────────┐
       │              │    Order     │
       │         ┌────┤──────────────┤
       │         │    │ id (PK)      │
       │         │    │ userId FK    │
       │         │    │ total        │
       │         │    │ status       │
       │         │    │ createdAt    │
       │         │    └──────┬───────┘
       │         │           │ 1:N
       │    ┌────▼───────────▼───────┐
       │    │      OrderItem         │
       └────┤────────────────────────┤
            │ id (PK)                │
            │ orderId FK             │
            │ name                   │
            │ price                  │
            │ quantity               │
            └────────────────────────┘
```

### Table Definitions

#### Product Table

```sql
CREATE TABLE "Product" (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    price       FLOAT NOT NULL,
    rating      FLOAT DEFAULT 0,
    reviews     INTEGER DEFAULT 0,
    "ecoScore"  FLOAT DEFAULT 5.0,
    description TEXT NOT NULL,
    category    TEXT NOT NULL,
    material    TEXT NOT NULL,
    "imageUrl"  TEXT NOT NULL,
    stock       INTEGER DEFAULT 100,
    featured    BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

#### User Table

```sql
CREATE TABLE "User" (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API Design

### 5.1 GET `/api/products`

**Description:** Fetches product list with optional filtering.

**Query Parameters:**
```
q         : string  (optional) - Full-text search on name/description/category
category  : string  (optional) - Filter by exact category
limit     : number  (optional, default 20) - Result limit
featured  : boolean (optional) - Show only featured products
```

**Response (200 OK):**
```json
[
  {
    "id": "clxyz...",
    "name": "Bamboo Toothbrush",
    "slug": "bamboo-toothbrush",
    "price": 120,
    "rating": 4.8,
    "reviews": 312,
    "ecoScore": 9.2,
    "description": "...",
    "category": "Personal Care",
    "material": "Bamboo, Nylon Bristles",
    "imageUrl": "/products/bamboo-toothbrush.jpg",
    "stock": 100,
    "featured": true
  }
]
```

**Implementation (Prisma Query):**
```typescript
const products = await prisma.product.findMany({
  where: q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ]
  } : undefined,
  orderBy: { ecoScore: 'desc' }
});
```

### 5.2 GET `/api/products/[slug]`

**Description:** Fetches a single product by URL slug.

**Response (200 OK):** Single Product object  
**Response (404):** `{ "error": "Product not found" }`

### 5.3 POST `/api/eco-score`

**Description:** Calculates an EcoScore for a product material.

**Request Body:**
```json
{
  "material": "bamboo",
  "category": "Personal Care"
}
```

**Response:**
```json
{
  "ecoScore": 9.2,
  "breakdown": {
    "biodegradable": true,
    "renewable": true,
    "lowCarbon": true
  }
}
```

---

## 6. AI / ML Pipeline

### 6.1 MobileNet Architecture

```
Input Image (any size)
        │
        ▼
┌───────────────────┐
│  HTML5 Canvas     │  ← Resize to 224×224 px
│  Preprocessing    │  ← Normalize pixel values [0, 1]
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  MobileNet v1     │  ← Loaded from TensorFlow.js CDN
│  (Quantized)      │  ← Runs on WebGL (GPU-accelerated)
│  ~4MB model size  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Top-3 Predictions│  ← className + probability
│  e.g.:            │
│  snorkel: 0.61    │
│  toothbrush: 0.21 │
│  brush: 0.12      │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────┐
│   Semantic Keyword Normalizer │
│                               │
│  Map: snorkel    → bamboo     │
│  Map: toothbrush → bamboo     │
│  Map: cup        → bottle     │
│  Map: bag        → tote       │
│  ... (40+ mappings)           │
└────────┬──────────────────────┘
         │  normalized keyword
         ▼
    GET /api/products?q={keyword}
         │
         ▼
    Eco Product Results Grid
```

### 6.2 Keyword Normalization Map (Sample)

```typescript
const keywordMap: Record<string, string> = {
  // Personal Care
  "toothbrush": "bamboo",
  "snorkel": "bamboo",        // MobileNet misclassification fix
  "brush": "bamboo",
  "dental": "bamboo",

  // Kitchen
  "cup": "bottle",
  "mug": "bottle",
  "bowl": "coconut",
  "wrap": "beeswax",
  "cling": "beeswax",

  // Stationery
  "notebook": "notebook",
  "book": "notebook",
  "pad": "notebook",

  // Bags / Accessories
  "bag": "tote",
  "purse": "tote",
  "handbag": "tote",
  
  // Personal Care Misc
  "shampoo": "shampoo",
  "soap": "shampoo",
  "lipstick": "lip",
  "balm": "lip",
};
```

### 6.3 Classification Flow

```
User opens /scanner page
       │
       ▼
TensorFlow.js loads MobileNet model (~4 MB)
       │
       ▼
User uploads image / uses camera
       │
       ▼
Canvas renders & preprocesses image (224×224)
       │
       ▼
model.classify(imageElement, topK=3) called
       │
       ▼
Top 3 class labels extracted
       │
       ├── Each label tokenized into words
       │
       ├── Each word checked against keywordMap
       │
       └── First match → query /api/products?q={mapped}
                │
                ├── Results found → render eco grid
                └── No results → show top-rated products (fallback)
```

---

## 7. Frontend Architecture

### 7.1 Routing Structure (Next.js App Router)

```
app/
├── layout.tsx          ← Root layout (fonts, global styles, providers)
├── page.tsx            ← / (Home: hero + featured products)
├── store/
│   └── page.tsx        ← /store (full catalog + search)
├── scanner/
│   └── page.tsx        ← /scanner (AI EcoScanner)
├── product/
│   └── [slug]/
│       └── page.tsx    ← /product/:slug (product detail)
└── api/
    ├── products/
    │   ├── route.ts        ← GET /api/products
    │   └── [slug]/
    │       └── route.ts    ← GET /api/products/:slug
    ├── eco-score/
    │   └── route.ts        ← POST /api/eco-score
    └── chat/
        └── route.ts        ← POST /api/chat
```

### 7.2 State Management

| State | Location | Method |
|-------|----------|--------|
| Cart items | Component local state | useState hook |
| Wishlist | localStorage | Custom hook |
| Auth session | React Context | Context API |
| Chat history | Component local state | useState hook |
| Scanner result | Component local state | useState hook |

### 7.3 Styling System

- **Framework:** Tailwind CSS 3.x
- **Animations:** Framer Motion (page transitions, card hover effects)
- **Icons:** Lucide React
- **Color Palette:**
  - Primary: `green-600` (#16a34a) — eco green
  - Secondary: `emerald-500` (#10b981)
  - Background: `gray-50` (#f9fafb)
  - Text: `gray-900` (#111827)

---

## 8. Security Design

### 8.1 Authentication Flow

```
User submits login form
        │
        ▼
POST /api/auth/login
        │
        ▼
Lookup User by email (Prisma)
        │
        ├── Not found → 401 Unauthorized
        │
        ▼
bcrypt.compare(password, hash)
        │
        ├── Mismatch → 401 Unauthorized
        │
        ▼
JWT signed with NEXTAUTH_SECRET
        │
        ▼
Token stored in httpOnly cookie
        │
        ▼
Protected routes check cookie on each request
```

### 8.2 Security Measures

| Threat | Mitigation |
|--------|-----------|
| SQL Injection | Prisma parameterized queries (not raw SQL) |
| XSS | React DOM escaping + CSP headers |
| CSRF | SameSite=Strict cookie attribute |
| Password Leak | bcrypt hash (cost factor 12) — never stored plaintext |
| API Key Exposure | All keys in `.env` (server-only, never bundled to client) |
| Image Privacy | MobileNet runs client-side — no images sent to server |

---

## 9. Deployment Architecture

```
Developer Machine
       │
       │ git push origin main
       ▼
GitHub Repository
  (adk532300-adk/ecoshop)
       │
       │ Webhook trigger
       ▼
Vercel Build Pipeline
  ├── npm install
  ├── prisma generate
  ├── next build
  └── Deploy to Edge Network (CDN)
       │
       ├── Static Assets → Vercel CDN (global)
       └── API Routes → Vercel Serverless Functions
                            │
                            │ SSL Connection
                            ▼
                    Neon PostgreSQL
                    (Serverless, Auto-scaling)
```

### 9.1 Environment Configuration

| Environment | Database | API URL |
|------------|----------|---------|
| Development | Local `.env` → Neon dev branch | `http://localhost:3000` |
| Production | Vercel Env Vars → Neon main branch | `https://ecoshop-tan.vercel.app` |

### 9.2 Cost Analysis

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby (free) | ₹0 |
| Neon PostgreSQL | Free tier (0.5 GB) | ₹0 |
| TensorFlow.js CDN | jsDelivr (free) | ₹0 |
| **Total** | | **₹0** |

---

## 10. Data Flow Diagrams

### 10.1 Store Catalog Flow

```
User visits /store
      │
      ▼
Server Component fetches products
      │  (via Prisma at build/request time)
      ▼
ProductCard components rendered
      │
      ▼
User types in search box
      │
      ▼
Client-side fetch: GET /api/products?q={term}
      │
      ▼
Prisma: case-insensitive LIKE query on Neon DB
      │
      ▼
JSON response → React state update → Re-render grid
```

### 10.2 AI Scanner Flow

```
User navigates to /scanner
      │
      ▼
TensorFlow.js + MobileNet loaded (browser)
      │
      ▼
User uploads / captures image
      │
      ▼
Canvas preprocessing (224×224 px)
      │
      ▼
model.classify() → Top 3 labels + scores
      │
      ▼
Semantic Keyword Normalizer maps labels
      │
      ├── Match found: GET /api/products?q={mapped_keyword}
      │         │
      │         ▼
      │     Prisma DB query → Results JSON
      │         │
      │         ▼
      │     Eco product grid rendered
      │
      └── No match: GET /api/products?featured=true (fallback)
```

### 10.3 User Authentication Flow

```
User clicks "Sign In" → AuthSplash modal opens
      │
      ▼
User enters email + password → Submit
      │
      ▼
POST /api/auth/login
      │
      ├── Email not found → Error: "Invalid credentials"
      │
      ▼
bcrypt.compare(inputPwd, storedHash)
      │
      ├── Mismatch → Error: "Invalid credentials"
      │
      ▼
JWT generated (signed with NEXTAUTH_SECRET, 7d expiry)
      │
      ▼
Set-Cookie: token=...; HttpOnly; SameSite=Strict; Secure
      │
      ▼
Modal closes → User context updated → Navbar shows avatar
```

---

## Appendix A – Technology Decision Matrix

| Decision | Option A | Option B | Choice | Reason |
|----------|----------|----------|--------|--------|
| AI Inference | Server-side GPU | Client-side TF.js | **Client-side** | Zero cost, privacy |
| Database | MongoDB Atlas | Neon PostgreSQL | **Neon** | Relational integrity, free tier |
| ORM | Mongoose | Prisma | **Prisma** | Type safety, migrations |
| Styling | Material UI | Tailwind CSS | **Tailwind** | Bundle size, customization |
| Hosting | AWS/GCP | Vercel | **Vercel** | GitHub integration, free tier |
| Framework | Express.js | Next.js | **Next.js** | SSR, API routes, one codebase |

---

*Document version 1.0 — EcoShop Academic Project, Sri Sairam Engineering College, 2026*
