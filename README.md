# 🌿 EcoShop – AI-Powered Eco-Friendly Product Finder

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ecoshop--tan.vercel.app-green?style=for-the-badge)](https://ecoshop-tan.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)

> An AI-powered e-commerce platform that helps users discover certified eco-friendly, biodegradable, and sustainable products using MobileNet image classification in the browser.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Team Members](#-team-members)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running Tests](#-running-tests)
- [Sample Data](#-sample-data)
- [API Reference](#-api-reference)
- [License](#-license)

---

## 🌍 Project Overview

EcoShop is a full-stack web application built as an academic project for the Department of Computer Science and Engineering at **Sri Sairam Engineering College, Chennai** (Anna University affiliated).

The platform features:
- **AI EcoScanner** – Users photograph a product; MobileNet classifies it in the browser (no server GPU needed) and finds eco-friendly alternatives.
- **Eco Store** – Catalog of 10+ certified biodegradable/sustainable products with EcoScores.
- **Smart Search** – Semantic keyword normalization handles MobileNet misclassifications.
- **User Auth** – Register/Login with hashed passwords and session tokens.

**SDG Alignment:** SDG 12 (Responsible Consumption), SDG 13 (Climate Action), SDG 14 (Life Below Water)

---

## 👥 Team Members

| Name | Register Number | Role |
|------|----------------|------|
| Rahul R K | 412422104085 | Full Stack Developer & AI Integration |
| Dinesh Kumar A | 412422104032 | Backend & Database Engineering |
| Agneeshwar P | 412422104008 | Frontend UI & UX Design |

**Guide:** Ms. Midhunadharshni G, Assistant Professor, Dept. of CSE  
**Institution:** Sri Sairam Engineering College, West Tambaram, Chennai – 600 044

---

## 🌐 Live Demo

| Page | URL |
|------|-----|
| Home / Store | https://ecoshop-tan.vercel.app |
| AI EcoScanner | https://ecoshop-tan.vercel.app/scanner |
| Product Details | https://ecoshop-tan.vercel.app/product/bamboo-toothbrush |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| **AI / ML** | TensorFlow.js, MobileNet v1 (quantized, browser-side) |
| **Backend** | Next.js API Routes (Edge-compatible) |
| **ORM** | Prisma ORM |
| **Database** | Neon Serverless PostgreSQL |
| **Deployment** | Vercel (Frontend + API), Neon (DB) |
| **Auth** | Custom JWT / bcrypt |

---

## ✨ Features

- 🔍 **AI Product Scanner** – Upload or capture a photo → MobileNet classifies → finds matching eco products
- 🧠 **Semantic Keyword Normalizer** – Maps AI misclassifications (e.g. "snorkel" → bamboo toothbrush)
- 🛒 **Eco Store** – Product grid with EcoScores (1–10), ratings, prices, and categories
- 📦 **Product Detail Pages** – Material specs, sustainability info, purchase flow
- 🔐 **User Authentication** – Register / Login / Logout with secure sessions
- 📊 **Impact Dashboard** – Shows user's cumulative CO₂ savings and plastic avoided
- 💬 **AI Chatbot** – Eco product advisor powered by Gemini API
- 📱 **Fully Responsive** – Works on mobile, tablet, and desktop

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Browser (Client)              │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ Next.js Pages│  │  TensorFlow.js  │  │
│  │ (React/TSX)  │  │  MobileNet v1   │  │
│  └──────┬───────┘  └────────┬────────┘  │
│         │ API Calls          │ Inference  │
└─────────┼────────────────────┼───────────┘
          │                    │
          ▼                    ▼
┌─────────────────┐   ┌──────────────────┐
│ Next.js API     │   │ Semantic Keyword  │
│ Routes (Vercel  │   │ Normalizer       │
│ Edge Functions) │   │ (client-side)    │
└────────┬────────┘   └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Prisma ORM     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Neon PostgreSQL│
│  (Serverless)   │
└─────────────────┘
```

See [`TECHNICAL_DESIGN.md`](TECHNICAL_DESIGN.md) for the full architecture document with diagrams.

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** ≥ 18.x ([Download](https://nodejs.org))
- **npm** ≥ 9.x (comes with Node.js)
- **Git** ([Download](https://git-scm.com))
- A **Neon PostgreSQL** account (free tier) — [neon.tech](https://neon.tech)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/adk532300-adk/ecoshop.git
cd ecoshop
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials (see [Environment Variables](#-environment-variables) section below).

### Step 4 — Set Up the Database

```bash
# Push schema to your Neon database
npx prisma db push

# Seed with sample eco-friendly products
npx prisma db seed
```

### Step 5 — Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6 — (Optional) Open Prisma Studio

```bash
npx prisma studio
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ─── DATABASE ──────────────────────────────────────────────────────────────
# Neon PostgreSQL connection string (use POOLED URL for app queries)
DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/neondb?sslmode=require"

# Direct URL used by Prisma migrations only (non-pooled)
DIRECT_URL="postgresql://username:password@ep-xxxx-direct.neon.tech/neondb?sslmode=require"

# ─── AUTH ──────────────────────────────────────────────────────────────────
# A random 32+ character secret string for JWT signing
NEXTAUTH_SECRET="replace-with-a-secure-random-secret-minimum-32-chars"

# Base URL of your app (use http://localhost:3000 for local dev)
NEXTAUTH_URL="http://localhost:3000"

# ─── PAYMENT GATEWAY (optional for testing) ────────────────────────────────
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_test_secret"
```

> ⚠️ **Never commit your `.env` file!** It is already listed in `.gitignore`.

### How to Get Neon PostgreSQL Credentials

1. Sign up at [neon.tech](https://neon.tech) (free)
2. Create a new project → name it `ecoshop`
3. Go to **Dashboard → Connection Details**
4. Copy the **Pooled connection string** → paste as `DATABASE_URL`
5. Copy the **Direct connection string** → paste as `DIRECT_URL`

---

## 🗄️ Database Setup

The database schema is managed by Prisma. Key models:

| Model | Description |
|-------|-------------|
| `Product` | Eco-friendly products (name, slug, price, ecoScore, material, category) |
| `User` | Registered users (email, hashed password) |
| `Order` | Purchase orders with status tracking |
| `OrderItem` | Line items within an order |
| `CartItem` | Items currently in a user's cart |

### Reset & Reseed Database

```bash
# Drop all tables and recreate
npx prisma migrate reset

# Or just push schema without migrating
npx prisma db push --force-reset

# Seed sample data
npx prisma db seed
```

---

## 🧪 Running Tests

### Unit / Integration Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Manual API Tests

Use the included test cases in [`tests/`](tests/):

```bash
# Test products API
node tests/api.test.js

# Test MobileNet classification
node tests/mobilenet.test.js
```

### Test with cURL

```bash
# Get all products
curl http://localhost:3000/api/products

# Search products by keyword
curl "http://localhost:3000/api/products?q=bamboo"

# Get single product
curl http://localhost:3000/api/products/bamboo-toothbrush
```

---

## 📦 Sample Data

The [`prisma/seed.ts`](prisma/seed.ts) file seeds the database with 10 eco-friendly products:

| Product | Category | EcoScore | Price (₹) |
|---------|----------|---------|-----------|
| Bamboo Toothbrush | Personal Care | 9.2 | 120 |
| Beeswax Food Wraps | Kitchen | 9.5 | 350 |
| Recycled Paper Notebook | Stationery | 8.8 | 199 |
| Organic Cotton Tote Bag | Accessories | 9.0 | 299 |
| Coconut Shell Bowl | Kitchen | 9.7 | 450 |
| Natural Shampoo Bar | Personal Care | 8.9 | 180 |
| Recycled Glass Water Bottle | Drinkware | 9.3 | 599 |
| Hemp Seed Lip Balm | Personal Care | 8.6 | 150 |
| Biodegradable Phone Case | Electronics | 8.4 | 499 |
| Compostable Garbage Bags | Home | 9.1 | 249 |

---

## 📡 API Reference

### `GET /api/products`

Returns all products or filters by search query.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search keyword (case-insensitive) |
| `category` | string | Filter by category |
| `limit` | number | Max results (default: 20) |

**Example Response:**
```json
[
  {
    "id": "clxyz123",
    "name": "Bamboo Toothbrush",
    "slug": "bamboo-toothbrush",
    "price": 120,
    "ecoScore": 9.2,
    "rating": 4.8,
    "category": "Personal Care",
    "material": "Bamboo, Nylon Bristles",
    "imageUrl": "/products/bamboo-toothbrush.jpg"
  }
]
```

### `GET /api/products/[slug]`

Returns a single product by its URL slug.

### `POST /api/eco-score`

Calculates EcoScore for a product based on material and category inputs.

---

## 📁 Project Structure

```
ecoshop/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Sample data seeder
│   └── migrations/          # Migration history
├── public/
│   └── products/            # Product images
├── src/
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   ├── store/           # Store catalog
│   │   ├── scanner/         # AI EcoScanner
│   │   ├── product/[slug]/  # Product detail
│   │   └── api/             # REST API routes
│   ├── components/
│   │   ├── store/           # Product cards, navbar
│   │   ├── auth/            # Login/Register modal
│   │   └── chatbot/         # AI chat drawer
│   └── lib/
│       ├── prisma.ts        # Prisma client singleton
│       └── data.ts          # Static data helpers
├── tests/                   # Test cases
├── TECHNICAL_DESIGN.md      # Architecture documentation
├── LICENSE                  # MIT License
├── .env.example             # Environment variable template
└── README.md                # This file
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [TensorFlow.js](https://www.tensorflow.org/js) for browser-side ML inference
- [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) for image classification
- [Neon](https://neon.tech) for serverless PostgreSQL
- [Prisma](https://prisma.io) for type-safe database access
- [Vercel](https://vercel.com) for hosting and deployment
- Sri Sairam Engineering College, Department of CSE
