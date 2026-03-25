# Lennox Web Banking Platform

A high-performance modern digital banking application tailored for fintech scale. Engineered as a fast single-page application using React, Vite, and backed by Supabase and Gemini APIs.

## Key Features

- **Robust Authentication:** Secure 2-step onboarding and OTP-backed login.
- **Account Management:** Centralized dashboard for Main Wallets, Checking, and Virtual Cards.
- **Money Movement:** High-speed peer-to-peer transfers, incoming request processing, and external Bill Pay.
- **Wealth & Investment:** High-Yield Saving capabilities alongside unified tracking for asset growth.
- **KYC Compliance:** Integrated user verification models bridging UI and secure logic.
- **Admin Dashboard:** Integrated oversight hub for user and transaction moderation.
- **AI Concierge:** Gemini-backed conversational interface for real-time customer support queries.

## Technology Stack

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Vanilla utilities), Lucide React Icons
- **Backend / DB Engine:** Supabase (PostgreSQL)
- **AI Agent Integration:** Google Gemini API (`@google/genai`)

## Project Setup

### 1. Prerequisites 
Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- NPM or regular Yarn

### 2. Environment Configuration
To run this project securely, **never commit real credentials.** Create an `.env` file at the root of the directory that matches this schema:

```env
API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Installation
Clone the repository and install the project dependencies:
```bash
npm install
```

### 4. Running the Development Server
Spin up the local `vite` environment on port `3000`:
```bash
npm run dev
```

## Deployment (Vercel Recommended)

1. Connect your Github repository to **Vercel**.
2. Within the Vercel Project Settings > Environment Variables, securely add your production strings mapping exactly to the `.env` template above.
3. Keep the default Build settings (`npm run build` and generic dist output).
4. Click Deploy.

## Security Practices
- Row Level Security (RLS) is enforced via Supabase policies where possible. 
- *Warning:* The `VITE_SUPABASE_SERVICE_ROLE_KEY` holds administrative privileges over the database tier and is strictly intended for Serverless environments (like Vercel API routes) or specific deployment conditions. Never hardcode it into public-facing component trees.
