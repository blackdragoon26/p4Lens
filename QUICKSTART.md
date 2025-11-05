# P4Lens - Quick Reference

## 🚀 Getting Started (30 seconds)

### Option 1: Automatic Startup
```bash
./start.sh
```
Visit: http://localhost:5173

### Option 2: Docker
```bash
docker-compose up --build
```
Visit: http://localhost:3000

## 📁 Project Structure
```
p4Lens/
├── backend/          # FastAPI + P4 Parser
├── frontend/         # React + Vite UI
├── README.md         # Full documentation
└── start.sh          # Quick start script
```

## 🔧 Common Commands

### Development
```bash
# Start everything
./start.sh

# Stop everything
./stop.sh

# Backend only
cd backend && uvicorn main:app --reload

# Frontend only
cd frontend && npm run dev
```

### Docker
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up --build

# View logs
docker-compose logs -f
```

## 📡 Endpoints

| Endpoint | Description |
|----------|-------------|
| http://localhost:5173 | Frontend UI (dev) |
| http://localhost:3000 | Frontend UI (Docker) |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | API Documentation |
| http://localhost:8000/health | Health Check |

## 📝 Usage

1. **Upload** a `.p4` file
2. **View** the interactive pipeline visualization
3. **Click** on nodes to see details
4. **Explore** tables, actions, headers, and externs

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
```

### Port already in use
```bash
# Kill processes on port 8000
lsof -ti:8000 | xargs kill -9

# Kill processes on port 5173
lsof -ti:5173 | xargs kill -9
```

### Docker issues
```bash
# Clean everything
docker-compose down -v
docker system prune -af
docker-compose up --build
```

## 📚 Documentation

- **README.md** - Full documentation
- **CONTRIBUTING.md** - How to contribute
- **CHANGELOG.md** - What changed
- **PROJECT_SUMMARY.md** - Overview of improvements

## 🔌 AWS Integration

See **README.md** section "AWS VSCode Server Integration" for:
- SSH setup
- P4 compilation
- Remote debugging
- Security best practices

## 💡 Tips

- Sample P4 files are in `backend/uploads/`
- Logs are in `backend.log` and `frontend.log`
- Use the minimap to navigate large programs
- Click nodes to see detailed information

## 🆘 Need Help?

1. Check README.md
2. Open an issue on GitHub
3. Review API docs at /docs endpoint

---

Built with ❤️ for the P4 community
