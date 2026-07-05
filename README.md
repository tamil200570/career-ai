# 🤖 CareerAI — AI-Powered Career Guidance Agent

> Personalized career path recommendations powered by **xAI Grok API**, built with **FastAPI + React + MongoDB Atlas**.

---

## 📸 Screenshots

> Add screenshots here after running the application.

---

## 🚀 Features

- 🧠 **AI-Powered Analysis** — xAI Grok API generates 5 career paths per analysis
- 📊 **Match Scoring** — Percentage match for each career suggestion  
- 🗺️ **Learning Roadmaps** — Step-by-step paths to reach your goal
- 🏆 **Certifications** — Recommended certifications per career
- 🏢 **Companies Hiring** — Real companies actively hiring  
- 📝 **Interview Tips** — Targeted preparation strategies
- 🔮 **Future Scope & Risk Analysis** — Make informed decisions
- 💾 **History** — All past analyses with search, filter & pagination
- 🔐 **JWT Auth** — Secure registration, login, and session management
- 🌙 **Dark Mode** — Beautiful glassmorphism dark UI

---

## 🏗️ Architecture

```
career-guidance-agent/
├── frontend/               # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── components/     # Navbar, Footer, Cards, Spinners, etc.
│       ├── pages/          # 9 pages: Home, Login, Register, Dashboard, ...
│       ├── services/       # Axios API services
│       ├── hooks/          # useAuth, useToast
│       └── context/        # AuthContext
├── backend/                # FastAPI + Motor + Grok
│   └── app/
│       ├── routers/        # auth, profile, recommendation
│       ├── services/       # ai_service, auth_service
│       ├── models/         # Pydantic MongoDB models
│       ├── schemas/        # Request/response validators
│       ├── middleware/      # JWT auth, rate limiter
│       ├── database/       # Singleton MongoDB connection
│       └── utils/          # JWT, response envelope, exceptions
├── docker-compose.yml
├── postman_collection.json
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router DOM |
| Backend | Python 3.12, FastAPI, Uvicorn |
| AI | xAI Grok API (`openai` Python SDK) |
| Database | MongoDB Atlas (Motor async driver) |
| Auth | JWT (`python-jose`) + bcrypt (`passlib`) |
| Rate Limiting | SlowAPI |
| Validation | Pydantic v2 |

---

## 📋 Prerequisites

- Python 3.12+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- xAI API key ([get one here](https://console.x.ai))

---

## ⚡ Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd career-guidance-agent
```

### 2. Backend Setup

```bash
cd backend

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your actual values

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**  
API Docs: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Copy and fill environment variables
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8000

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=career_guidance
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
XAI_API_KEY=your-xai-api-key-here
XAI_MODEL=grok-beta
CORS_ORIGIN=http://localhost:5173
PORT=8000
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ **Never commit `.env` files to version control.**

---

## 🐳 Docker Compose (Local Dev)

```bash
# Copy .env files first (backend/.env and frontend/.env)
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## 📡 API Documentation

All responses follow the envelope format:
```json
{
  "success": true,
  "message": "...",
  "data": {},
  "timestamp": "2024-01-01T00:00:00+00:00"
}
```

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Register new user |
| `POST` | `/api/auth/login` | No | Login, get JWT token |
| `GET`  | `/api/profile` | ✅ | Get current user profile |
| `PUT`  | `/api/profile` | ✅ | Update profile |
| `PUT`  | `/api/profile/password` | ✅ | Change password |
| `POST` | `/api/recommend` | ✅ | Generate AI career recommendations |
| `GET`  | `/api/history` | ✅ | Get recommendation history (paginated) |
| `DELETE` | `/api/history/{id}` | ✅ | Delete a recommendation |

**Interactive docs:** http://localhost:8000/docs

**Postman Collection:** Import `postman_collection.json` into Postman.

---

## 🤖 AI Service

The AI service (`backend/app/services/ai_service.py`) uses the OpenAI SDK connected to the xAI Grok API:

- Reads `XAI_API_KEY` and `XAI_MODEL` from env
- Structured JSON prompt (never markdown/plain text)
- Retry logic on rate limits and API errors (up to 3 attempts)
- JSON extraction with markdown fence stripping
- Typed exceptions for all failure modes

---

## 🏛️ MongoDB Collections

### `users`
```
name, email, password (hashed), education, experience, skills, bio, created_at, updated_at
```

### `recommendations`
```
user_id, name, education, college, cgpa, years_of_experience, skills, interests,
career_goal, preferred_industry, preferred_location, expected_salary,
recommendation (AI JSON), created_at
```

---

## 🚀 Deployment

### Frontend — Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set root directory: `frontend`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url`
5. Deploy!

### Backend — AWS App Runner

1. Create `apprunner.yaml` in `backend/`:
```yaml
version: 1.0
runtime: python311
build:
  commands:
    build:
      - pip install -r requirements.txt
run:
  command: uvicorn app.main:app --host 0.0.0.0 --port 8080
  network:
    port: 8080
  env:
    - name: MONGODB_URI
      value: <from-secrets-manager>
```
2. Create App Runner service pointing to your GitHub repo
3. Set all environment variables in App Runner console
4. Update `CORS_ORIGIN` to your Vercel frontend URL

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens with configurable expiry
- CORS restricted to configured origins
- Rate limiting: 10 req/min (register), 20 req/min (login)
- All protected routes require valid JWT
- No secrets hardcoded — all from env vars
- Input validation via Pydantic v2

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MongoDB connection failed` | Check `MONGODB_URI` and whitelist your IP in Atlas |
| `Grok API error` | Verify `XAI_API_KEY` is valid and has quota |
| `CORS error` | Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL |
| `JWT invalid` | Check `JWT_SECRET` matches between restarts |
| Frontend can't reach backend | Verify `VITE_API_BASE_URL` in frontend `.env` |
| `pip install` fails | Use Python 3.12+, check for system-level dependencies |
| `npm install` fails | Use Node.js 18+, delete `node_modules` and retry |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ using FastAPI, React, and xAI Grok*
