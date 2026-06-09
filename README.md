# Taplyzer B2B Matchmaking Engine

This repository contains the **Taplyzer** B2B matchmaking platform, split into a Next.js frontend application and a standalone Express-based matching service (backend).

---

## Directory Structure

```
├── frontend/               # Next.js frontend application & client-side routes
│   ├── app/                # Next.js App Router (pages and API endpoints)
│   ├── components/         # Reusable UI components
│   ├── lib/                # Database adapters, helpers, and utilities
│   ├── models/             # Schema-less Firestore models
│   ├── public/             # Static public assets
│   └── package.json        # Frontend dependencies & scripts
│
├── backend/                # Node.js & Express matching engine microservice
│   ├── src/                # Backend source code
│   │   ├── lib/db.js       # Firebase Admin initialization
│   │   └── matchEngine.js  # Main Express match engine logic
│   └── package.json        # Backend dependencies & scripts
│
└── .gitignore              # Main gitignore configuration
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.x or later recommended)
- **npm** (v9.x or later)
- **Firebase Firestore Database** (dev instance)

### 2. Configure Environment Variables
Copy the example files and configure them with your credentials:

- **Frontend**:
  ```bash
  cd frontend
  cp .env.example .env.local
  # Edit .env.local with your credentials
  ```

- **Backend**:
  ```bash
  cd ../backend
  cp .env.example .env
  # Edit .env with your credentials
  ```

### 3. Run Locally

- **Run Frontend (Next.js)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  # Runs at http://localhost:3000
  ```

- **Run Backend (Express Match Engine)**:
  ```bash
  cd backend
  npm install
  npm run dev
  # Runs at http://localhost:5000
  ```

---

## Deployment Guides

### Frontend: Vercel
Vercel is the recommended hosting platform for Next.js apps.

1. **Push your code to GitHub**.
2. **Log into Vercel** and select **Add New > Project**.
3. Import your GitHub repository.
4. Set the following options:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
5. Under **Environment Variables**, add the environment variables defined in your `frontend/.env.local` (or `frontend/.env.example` template).
6. Click **Deploy**.

---

### Backend: Render
Render is a cloud hosting provider ideal for Express web servers.

1. **Log into Render** and select **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service settings:
   - **Name**: `taplyzer-match-engine`
   - **Runtime**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables** / **Advanced**:
   - Add the key-value pairs from your `backend/.env` (or `backend/.env.example` template).
   - Ensure you set `PORT=5000` or let Render automatically define it.
5. Click **Create Web Service**.
