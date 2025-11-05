# P4Lens 🔍

**Interactive P4 Program Visualizer** - Upload and visualize P4 programs with an intuitive, interactive pipeline flow diagram.

![P4Lens](https://img.shields.io/badge/P4-Visualization-blue)
![Python](https://img.shields.io/badge/python-3.11-blue)
![React](https://img.shields.io/badge/react-19.1-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)

## 🌟 Features

- **Interactive Visualization**: Explore P4 program structure with an interactive flow diagram
- **Pipeline Analysis**: Visualize Parser, Ingress Control, Egress Control, and Deparser
- **Table & Action Inspection**: View match-action tables, keys, and associated actions
- **Header Definitions**: Inspect all header definitions and field specifications
- **Extern Objects**: See counters, meters, registers, and digest objects
- **Support for P4₁₄ and P4₁₆**: Works with both P4 language versions
- **Real-time Parsing**: Upload and parse P4 files instantly
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and React Flow

## 🏗️ Architecture

```
p4Lens/
├── backend/          # FastAPI backend for P4 parsing
│   ├── main.py       # API endpoints
│   ├── parser_utils.py  # P4 parsing logic
│   ├── Dockerfile    # Backend container
│   └── requirements.txt
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx   # Main application
│   │   └── components/ui/
│   │       ├── PipelineFlow.jsx  # ReactFlow visualization
│   │       ├── card.jsx
│   │       └── button.jsx
│   ├── Dockerfile    # Frontend container
│   └── package.json
└── docker-compose.yml
```

## 🚀 Quick Start

### Option 1: Local Development

#### Prerequisites
- Python 3.11+
- Node.js 20+
- npm or yarn

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Option 2: Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## 📖 Usage

1. **Upload a P4 File**: Click on the upload area and select a `.p4` file
2. **Visualize**: The parser will extract the program structure and display it
3. **Explore**: Click on any node to see detailed information about:
   - Tables and their keys
   - Actions
   - Headers and field definitions
   - Extern objects
4. **Navigate**: Use the minimap and controls to navigate the pipeline
5. **Upload Another**: Click "Upload Another File" to analyze a different program

## 🔧 API Endpoints

### `GET /`
Health check endpoint

### `GET /health`
Returns API health status

### `POST /upload`
Upload and parse a P4 file

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (P4 file)

**Response:**
```json
{
  "filename": "example.p4",
  "structure": {
    "ParserName": {
      "type": "parser",
      "tables": [],
      "headers": [],
      "externs": [],
      ...
    },
    "_tables": {...},
    "_headers": {...},
    "_externs": [...],
    ...
  }
}
```

## 🔌 AWS VSCode Server Integration

P4Lens can be enhanced with a remote AWS VSCode Server that has P4 compiler and dependencies pre-installed. This enables advanced features like P4 compilation, validation, and more sophisticated analysis.

### Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌────────────────────┐
│   P4Lens UI     │  HTTP   │   FastAPI    │   SSH   │  AWS VSCode Server │
│   (Frontend)    │────────>│   Backend    │────────>│  (P4 Compiler)     │
└─────────────────┘         └──────────────┘         └────────────────────┘
```

### Setup Guide

#### 1. AWS VSCode Server Setup

Your AWS instance should have:
- P4 compiler (`p4c`)
- P4 runtime dependencies
- SSH access enabled
- VSCode Server (optional for IDE access)

#### 2. Backend Integration

Add SSH and compilation support to the backend:

**Update `backend/requirements.txt`:**
```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12
paramiko==3.4.0  # For SSH connections
```

**Create `backend/p4_compiler.py`:**
```python
import paramiko
import os
from typing import Optional, Dict

class P4Compiler:
    def __init__(self, host: str, username: str, key_path: str, port: int = 22):
        self.host = host
        self.username = username
        self.key_path = key_path
        self.port = port
        
    def compile_p4(self, p4_file_path: str) -> Dict[str, any]:
        """Compile P4 file on remote server"""
        try:
            # Connect via SSH
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                self.host, 
                port=self.port,
                username=self.username,
                key_filename=self.key_path
            )
            
            # Transfer file to remote
            sftp = client.open_sftp()
            remote_path = f"/tmp/{os.path.basename(p4_file_path)}"
            sftp.put(p4_file_path, remote_path)
            
            # Compile P4
            stdin, stdout, stderr = client.exec_command(
                f"p4c --target bmv2 --arch v1model {remote_path}"
            )
            
            compilation_output = stdout.read().decode()
            compilation_errors = stderr.read().decode()
            
            # Cleanup
            sftp.remove(remote_path)
            sftp.close()
            client.close()
            
            return {
                "success": not compilation_errors,
                "output": compilation_output,
                "errors": compilation_errors
            }
        except Exception as e:
            return {
                "success": False,
                "errors": str(e)
            }
```

**Update `backend/main.py`** to add compilation endpoint:
```python
from p4_compiler import P4Compiler
import os

# Initialize compiler (use environment variables for security)
compiler = None
if os.getenv("P4_REMOTE_HOST"):
    compiler = P4Compiler(
        host=os.getenv("P4_REMOTE_HOST"),
        username=os.getenv("P4_REMOTE_USER", "ubuntu"),
        key_path=os.getenv("P4_SSH_KEY_PATH", "~/.ssh/id_rsa")
    )

@app.post("/compile")
async def compile_p4(file: UploadFile = File(...)):
    if not compiler:
        raise HTTPException(
            status_code=503, 
            detail="Remote P4 compiler not configured"
        )
    
    # Save file
    path = os.path.join(UPLOAD_DIR, file.filename)
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    
    # Compile
    result = compiler.compile_p4(path)
    return result
```

#### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# AWS VSCode Server Configuration
P4_REMOTE_HOST=your-aws-instance.compute.amazonaws.com
P4_REMOTE_USER=ubuntu
P4_SSH_KEY_PATH=/path/to/your/aws-key.pem
```

#### 4. Docker Configuration

Update `docker-compose.yml` to mount SSH keys:

```yaml
services:
  backend:
    build: ./backend
    container_name: p4lens-backend
    ports:
      - "8000:8000"
    volumes:
      - ~/.ssh:/root/.ssh:ro  # Mount SSH keys (read-only)
      - ./backend/.env:/app/.env:ro
    environment:
      - P4_REMOTE_HOST=${P4_REMOTE_HOST}
      - P4_REMOTE_USER=${P4_REMOTE_USER}
      - P4_SSH_KEY_PATH=/root/.ssh/aws-key.pem
    restart: always
```

#### 5. Frontend Integration

Add a "Compile" button in the UI:

```jsx
const compile = async () => {
  if (!file) return;
  setLoading(true);
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await axios.post("/api/compile", form);
    if (res.data.success) {
      alert("Compilation successful!");
    } else {
      alert(`Compilation failed:\n${res.data.errors}`);
    }
  } catch (err) {
    alert("Failed to compile P4 file");
  } finally {
    setLoading(false);
  }
};
```

### Security Notes

⚠️ **Important Security Practices:**

1. **Never commit SSH keys** to version control
2. Use **environment variables** for sensitive data
3. Use **IAM roles** and **AWS Systems Manager** for better security
4. Implement **rate limiting** on compilation endpoints
5. Use **VPC** and **security groups** to restrict access
6. Consider using **AWS Secrets Manager** for credentials

## 🛠️ Development

### Backend Development

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run tests (if implemented)
pytest

# Check code quality
black .
flake8
```

### Frontend Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 📝 Parser Capabilities

The P4 parser extracts:

- **Parser blocks**: Entry points and state machines
- **Control blocks**: Ingress/egress pipelines
- **Deparser blocks**: Packet reassembly
- **Tables**: Match-action tables with keys and actions
- **Headers**: Packet header definitions with fields and bit widths
- **Externs**: Counter, Meter, Register, Digest objects
- **Constants & Enums**: Named values

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🐛 Known Issues & Future Work

- [ ] Support for more complex P4 constructs
- [ ] P4Runtime integration
- [ ] Export visualizations as images
- [ ] Multiple file analysis and comparison
- [ ] Integration with P4 debuggers
- [ ] Support for custom architectures beyond v1model

## 💡 Tips

- Use sample P4 programs from `backend/uploads/` to test
- The parser works best with well-formatted P4 code
- For large programs, use the minimap to navigate
- Click on nodes to see detailed information

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ for the P4 community
