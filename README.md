# Miryalaguda Agri Exports - B2B Website

This project is a complete, modern, and responsive B2B website for a rice canvassing and merchant export business, built with React, Tailwind CSS v4, and a Python FastAPI backend.

## Tech Stack
- **Frontend**: React (Vite), React Router, Tailwind CSS v4, Lucide React (Icons).
- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic.

## Prerequisites
- Node.js (v18+)
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

# Install dependencies (fastapi, uvicorn, pydantic)
pip install fastapi uvicorn pydantic

# Run the server
uvicorn main:app --reload
```
The FastAPI backend will start running at `http://localhost:8000`. 
*Note: A SQLite database (`market_data.db`) will be automatically created and seeded with initial pricing data upon the first startup.*

To notify an external CRM or automation service when a lead is saved, set
`LEAD_NOTIFICATION_WEBHOOK_URL` in `backend/.env`. If it is left empty, the
lead is still saved and its notification status is recorded as `not_configured`.

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
