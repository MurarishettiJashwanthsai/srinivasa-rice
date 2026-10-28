# Sri Srinivasa Canvassing - Website and Admin

This repository contains the public B2B website, secure administration portal, and FastAPI backend.

## Tech Stack
- **Frontend**: React (Vite), React Router, Tailwind CSS v4, Lucide React (Icons).
- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic.

## Prerequisites
- Node.js 22 or newer
- Python (v3.10+)

## Getting Started

### 1. Run the Python Backend
The backend serves a simple API to handle form submissions from the Contact Us page.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Create local configuration and replace every placeholder value
cp .env.example .env

# Run the server
uvicorn main:app --reload
```
The FastAPI backend will start running at `http://localhost:8000`. Local development can use SQLite. Production requires a configured PostgreSQL `DATABASE_URL`; startup migrations preserve existing records and do not seed or overwrite genuine products or enquiries.

To notify an external CRM or automation service when a lead is saved, set
`LEAD_NOTIFICATION_WEBHOOK_URL` in `backend/.env`. If it is left empty, the
lead is still saved and its notification status is recorded as `not_configured`.

`ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` are required for secure administrative
sign-in. Generate the hash locally, then copy only its output to the
`ADMIN_PASSWORD_HASH` environment variable in Render:

```bash
cd backend
python -c "from getpass import getpass; from passlib.hash import pbkdf2_sha256; print(pbkdf2_sha256.hash(getpass('New admin password: ')))"
```

Use a unique password of at least 14 characters. `ADMIN_PASSWORD` remains only as
a temporary migration fallback so an existing deployment can be upgraded safely;
remove it from Render immediately after the hash is working. There is no
source-code fallback account. Never commit real secrets, and rotate any credential
that has appeared in source control or chat.

### 2. Run the React Frontend
The frontend uses Vite for ultra-fast development.

```bash
# Navigate to the frontend directory
cd frontend

# Install all NodeJS dependencies
npm install

# Start the Vite development server
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`. 

## Project Structure
- `frontend/src/App.jsx` - Main application with routing logic.
- `frontend/src/index.css` - Global styles and Tailwind v4 theme definitions (Earthy tones).
- `frontend/src/pages/` - Includes Home, About, Products, Packaging, Certifications, Contact, Legal.
- `frontend/src/components/` - Reusable UI components like Navbar and Footer.
- `backend/main.py` - FastAPI entry point handling the `/api/contact` POST route.

## Features
- Deep integration between React and FastAPI via standard REST calls.
- Completely mobile responsive layout built with Tailwind CSS.
- Modern aesthetics using an Agricultural/Earthy color palette.
- Route-specific scroll restoration and hash handling for the Legal policies page.
