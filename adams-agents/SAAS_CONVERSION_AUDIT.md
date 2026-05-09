# SaaS Conversion Audit - Adams Agents

## Overview
This document audits the current desktop CLI application and outlines all changes needed to convert it to a multi-tenant SaaS platform using:
- **Backend**: Python + FastAPI
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React + Vite
- **Authentication**: Web-based OAuth2 (replacing desktop OAuth)

## 🏗️ Architecture Changes Required

### Current State: Desktop CLI App
- Single-user, local file storage
- Desktop OAuth2 authentication
- Local CSV metadata storage
- Direct file system access
- Command-line interface

### Target State: Multi-tenant SaaS
- Web-based multi-user system
- Web OAuth2 authentication
- Supabase database with user isolation
- Cloud file storage (Google Drive + local)
- Web dashboard interface

---

## 🔐 Authentication & User Management

### Current Implementation
```python
# utils/google_drive.py
class GoogleDriveManager:
    def __init__(self):
        self.service = None
        self.folder_cache = {}
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Drive API using environment variables"""
        # Desktop OAuth2 flow
        flow = InstalledAppFlow.from_client_config(client_config, self.SCOPES)
        creds = flow.run_local_server(port=0)
```

### Required Changes
1. **Replace desktop OAuth with web OAuth**
2. **Add user session management**
3. **Implement user registration/login**
4. **Add user ID to all operations**

### New Authentication Flow
```python
# New: web_oauth.py
class WebGoogleDriveManager:
    def __init__(self, user_id: str, access_token: str):
        self.user_id = user_id
        self.access_token = access_token
        self.service = self._build_service()
    
    def _build_service(self):
        """Build service using web OAuth access token"""
        credentials = Credentials(
            token=self.access_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        return build('drive', 'v3', credentials=credentials)
```

---

## 🗄️ Database Schema Changes

### Current: CSV Metadata Storage
```python
# utils/project_manager.py
class ProjectManager:
    def __init__(self, projects_dir: str = "projects"):
        self.metadata_file = self.projects_dir / "metadata.csv"
    
    def _init_metadata_file(self):
        headers = [
            "project_id", "topic", "context", "created_at", "status",
            "outline_generated", "script_generated", "audio_generated",
            "voice_id", "speed", "segments_count", "total_duration", "drive_synced"
        ]
```

### New: Supabase Schema
```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    context TEXT,
    status VARCHAR(50) DEFAULT 'created',
    voice_id VARCHAR(255),
    speed DECIMAL(3,2) DEFAULT 1.07,
    segments_count INTEGER DEFAULT 0,
    total_duration VARCHAR(20) DEFAULT '0:00',
    drive_synced BOOLEAN DEFAULT FALSE,
    drive_folder_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- project_files table
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- 'outline', 'script', 'script_cleaned', 'audio'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    drive_file_id VARCHAR(255),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_google_tokens table
CREATE TABLE user_google_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Project Management Changes

### Current: Local File System
```python
# utils/project_manager.py
def create_project(self, topic: str, context: str, voice_id: str = "iP95p4xoKVk53GoZ742B", speed: float = 1.07) -> str:
    project_id = self._generate_project_id(topic)
    project_dir = self.projects_dir / project_id
    project_dir.mkdir(exist_ok=True)
    (project_dir / "audio").mkdir(exist_ok=True)
```

### New: Database + Cloud Storage
```python
# New: project_service.py
class ProjectService:
    def __init__(self, db: Database, user_id: str):
        self.db = db
        self.user_id = user_id
    
    async def create_project(self, topic: str, context: str, voice_id: str = None, speed: float = 1.07) -> dict:
        project_data = {
            "user_id": self.user_id,
            "topic": topic,
            "context": context,
            "voice_id": voice_id,
            "speed": speed,
            "status": "created"
        }
        
        query = """
            INSERT INTO projects (user_id, topic, context, voice_id, speed, status)
            VALUES (:user_id, :topic, :context, :voice_id, :speed, :status)
            RETURNING *
        """
        result = await self.db.fetch_one(query, project_data)
        return dict(result)
    
    async def get_user_projects(self) -> List[dict]:
        query = "SELECT * FROM projects WHERE user_id = :user_id ORDER BY created_at DESC"
        results = await self.db.fetch_all(query, {"user_id": self.user_id})
        return [dict(row) for row in results]
```

---

## 📁 File Storage Changes

### Current: Local File System
```python
# cli.py - generate_outline
outline_file = pm.projects_dir / project["project_id"] / "outline.txt"
with open(outline_file, 'w') as f:
    f.write(outline)
```

### New: Hybrid Storage (Local + Google Drive)
```python
# New: file_storage_service.py
class FileStorageService:
    def __init__(self, local_storage_path: str, google_drive_manager: WebGoogleDriveManager):
        self.local_storage_path = local_storage_path
        self.google_drive_manager = google_drive_manager
    
    async def save_outline(self, project_id: str, user_id: str, content: str) -> dict:
        # Save locally
        local_path = f"{self.local_storage_path}/{user_id}/{project_id}/outline.txt"
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, 'w') as f:
            f.write(content)
        
        # Save to Google Drive
        drive_file_id = await self.google_drive_manager.upload_file(
            local_path, 
            f"outlines/{project_id}/outline.txt"
        )
        
        # Update database
        file_record = {
            "project_id": project_id,
            "file_type": "outline",
            "file_name": "outline.txt",
            "file_path": local_path,
            "drive_file_id": drive_file_id
        }
        
        return file_record
```

---

## 🌐 API Endpoints (FastAPI)

### Project Management
```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

app = FastAPI(title="Adams Agents API")

@app.post("/api/projects")
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user)
):
    project_service = ProjectService(db, current_user.id)
    return await project_service.create_project(**project_data.dict())

@app.get("/api/projects")
async def list_projects(current_user: User = Depends(get_current_user)):
    project_service = ProjectService(db, current_user.id)
    return await project_service.get_user_projects()

@app.post("/api/projects/{project_id}/generate-outline")
async def generate_outline(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    # Generate outline using AI
    # Save to storage
    # Update database
    pass
```

### File Operations
```python
@app.post("/api/projects/{project_id}/upload-audio")
async def upload_audio(
    project_id: str,
    files: List[UploadFile],
    current_user: User = Depends(get_current_user)
):
    # Save audio files
    # Upload to Google Drive
    # Update database
    pass

@app.get("/api/projects/{project_id}/files")
async def get_project_files(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    # Get files for specific project
    pass
```

---

## 🔧 Configuration Changes

### Current: Environment Variables
```bash
# .env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### New: Multi-environment Configuration
```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Google OAuth (Web)
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback"
    
    # AI Services
    OPENAI_API_KEY: str
    GOOGLE_GEMINI_API_KEY: str
    ELEVENLABS_API_KEY: str
    
    # File Storage
    LOCAL_STORAGE_PATH: str = "./uploads"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
```

---

## 🎨 Frontend Changes (React + Vite)

### Current: CLI Interface
```python
# cli.py
@cli.command()
@click.argument('project_identifier')
def generate_outline(project_identifier):
    """Generate an outline for a project"""
    # CLI logic
```

### New: React Components
```typescript
// components/ProjectList.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProjectService } from '../services/ProjectService';

export const ProjectList: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    
    useEffect(() => {
        if (user) {
            ProjectService.getUserProjects().then(setProjects);
        }
    }, [user]);
    
    return (
        <div className="projects-grid">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
};

// components/ProjectCard.tsx
export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <div className="project-card">
            <h3>{project.topic}</h3>
            <p>{project.context}</p>
            <div className="project-actions">
                <button onClick={() => generateOutline(project.id)}>
                    Generate Outline
                </button>
                <button onClick={() => generateScript(project.id)}>
                    Generate Script
                </button>
                <button onClick={() => generateAudio(project.id)}>
                    Generate Audio
                </button>
            </div>
        </div>
    );
};
```

---

## 🔄 Workflow Changes

### Current: CLI Commands
```bash
# Current workflow
python cli.py create --topic "AI in Healthcare" --context "Medical applications"
python cli.py generate_outline "AI in Healthcare"
python cli.py generate_script "AI in Healthcare"
python cli.py generate_audio "AI in Healthcare"
python cli.py upload-to-drive "AI in Healthcare"
```

### New: Web-based Workflow
```typescript
// New workflow
// 1. User creates project via web form
const project = await ProjectService.createProject({
    topic: "AI in Healthcare",
    context: "Medical applications"
});

// 2. Generate content via API calls
const outline = await ProjectService.generateOutline(project.id);
const script = await ProjectService.generateScript(project.id);
const audio = await ProjectService.generateAudio(project.id);

// 3. Files automatically saved to storage + Google Drive
// 4. Database updated with file references
```

---

## 🚀 Deployment Considerations

### Environment Setup
```bash
# Production .env
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_web_client_id
GOOGLE_CLIENT_SECRET=your_web_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
SECRET_KEY=your_secret_key
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Infrastructure
- **Backend**: Deploy FastAPI to cloud (AWS, GCP, Azure)
- **Database**: Supabase managed PostgreSQL
- **Frontend**: Deploy React app to CDN (Vercel, Netlify)
- **File Storage**: Local storage + Google Drive API
- **Authentication**: JWT tokens + Google OAuth

---

## 📋 Implementation Checklist

### Phase 1: Backend Foundation
- [ ] Set up FastAPI project structure
- [ ] Create Supabase database schema
- [ ] Implement user authentication service
- [ ] Create project management service
- [ ] Set up file storage service

### Phase 2: API Development
- [ ] Implement project CRUD endpoints
- [ ] Create content generation endpoints
- [ ] Add file upload/download endpoints
- [ ] Implement Google Drive integration
- [ ] Add user management endpoints

### Phase 3: Frontend Development
- [ ] Set up React + Vite project
- [ ] Create authentication components
- [ ] Build project management interface
- [ ] Implement content generation forms
- [ ] Add file management interface

### Phase 4: Integration & Testing
- [ ] Connect frontend to backend APIs
- [ ] Test multi-user scenarios
- [ ] Implement error handling
- [ ] Add logging and monitoring
- [ ] Performance optimization

### Phase 5: Deployment
- [ ] Set up production environment
- [ ] Configure CI/CD pipeline
- [ ] Deploy backend and frontend
- [ ] Set up monitoring and alerts
- [ ] User acceptance testing

---

## 🔒 Security Considerations

### Authentication
- JWT token management
- OAuth2 state parameter validation
- CSRF protection
- Rate limiting

### Data Isolation
- User ID filtering on all queries
- Row-level security in Supabase
- File access validation
- API endpoint authorization

### File Security
- File type validation
- File size limits
- Virus scanning
- Secure file deletion

---

## 📊 Performance Considerations

### Database
- Index on user_id for projects table
- Connection pooling
- Query optimization
- Caching strategies

### File Storage
- Async file operations
- Streaming for large files
- CDN for static assets
- Background job processing

### API
- Response caching
- Request validation
- Error handling
- Monitoring and metrics

---

## 💰 Business Model Considerations

### Multi-tenancy
- User subscription tiers
- Usage limits and quotas
- Feature access control
- Billing integration

### Analytics
- User activity tracking
- Content generation metrics
- Storage usage monitoring
- Performance analytics

---

This audit provides a comprehensive roadmap for converting the desktop CLI application to a multi-tenant SaaS platform. Each section includes specific code examples and implementation details to guide the development process. 