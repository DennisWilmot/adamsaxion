import csv
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class ProjectManager:
    def __init__(self, projects_dir: str = "projects"):
        self.projects_dir = Path(projects_dir)
        self.projects_dir.mkdir(exist_ok=True)
        self.metadata_file = self.projects_dir / "metadata.csv"
        self._init_metadata_file()
    
    def _init_metadata_file(self):
        """Initialize the metadata CSV file with headers if it doesn't exist"""
        if not self.metadata_file.exists():
            headers = [
                "project_id",
                "topic", 
                "context",
                "created_at",
                "status",
                "outline_generated",
                "script_generated", 
                "audio_generated",
                "voice_id",
                "speed",
                "segments_count",
                "total_duration",
                "drive_synced"
            ]
            
            with open(self.metadata_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
    
    def create_project(self, topic: str, context: str, voice_id: str = "iP95p4xoKVk53GoZ742B", speed: float = 1.07) -> str:
        """Create a new project and add it to metadata"""
        # Generate project ID from topic
        project_id = self._generate_project_id(topic)
        
        # Create project directory with human-readable name
        project_dir = self.projects_dir / project_id
        project_dir.mkdir(exist_ok=True)
        (project_dir / "audio").mkdir(exist_ok=True)
        
        # Add to metadata CSV
        project_data = {
            "project_id": project_id,
            "topic": topic,
            "context": context,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "created",
            "outline_generated": "",
            "script_generated": "",
            "audio_generated": "",
            "voice_id": voice_id,
            "speed": speed,
            "segments_count": 0,
            "total_duration": "0:00",
            "drive_synced": "no"
        }
        
        self._add_project_to_csv(project_data)
        return project_id
    
    def _generate_project_id(self, topic: str) -> str:
        """Generate a unique project ID from topic"""
        # Convert topic to lowercase, replace spaces with hyphens, remove special chars
        base_id = "".join(c.lower() if c.isalnum() else "-" for c in topic)
        base_id = "-".join(filter(None, base_id.split("-")))
        
        # Add timestamp to ensure uniqueness
        timestamp = datetime.now().strftime("%Y%m%d-%H%M")
        return f"{base_id}-{timestamp}"
    
    def _add_project_to_csv(self, project_data: Dict):
        """Add a new project row to the metadata CSV"""
        with open(self.metadata_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=project_data.keys())
            writer.writerow(project_data)
    
    def update_project_status(self, project_id: str, status: str, **updates):
        """Update project status and other fields"""
        projects = self._read_all_projects()
        
        for project in projects:
            if project["project_id"] == project_id:
                project.update(updates)
                project["status"] = status
                break
        
        self._write_all_projects(projects)
    
    def _read_all_projects(self) -> List[Dict]:
        """Read all projects from CSV"""
        projects = []
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                projects = list(reader)
        return projects
    
    def _write_all_projects(self, projects: List[Dict]):
        """Write all projects back to CSV"""
        if projects:
            with open(self.metadata_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=projects[0].keys())
                writer.writeheader()
                writer.writerows(projects)
    
    def list_projects(self) -> List[Dict]:
        """Get all projects"""
        return self._read_all_projects()
    
    def get_project(self, project_id: str) -> Optional[Dict]:
        """Get a specific project by ID"""
        projects = self._read_all_projects()
        for project in projects:
            if project["project_id"] == project_id:
                return project
        return None
    
    def project_exists(self, project_id: str) -> bool:
        """Check if a project exists"""
        return self.get_project(project_id) is not None
    
    def find_project_by_topic(self, topic: str) -> Optional[Dict]:
        """Find a project by topic (partial match)"""
        projects = self._read_all_projects()
        topic_lower = topic.lower()
        
        # First try exact match
        for project in projects:
            if project["topic"].lower() == topic_lower:
                return project
        
        # Then try partial match
        for project in projects:
            if topic_lower in project["topic"].lower():
                return project
        
        return None
    
    def search_projects(self, search_term: str) -> List[Dict]:
        """Search projects by topic or context"""
        projects = self._read_all_projects()
        search_lower = search_term.lower()
        matches = []
        
        for project in projects:
            if (search_lower in project["topic"].lower() or 
                search_lower in project["context"].lower()):
                matches.append(project)
        
        return matches
    
    def get_project_display_name(self, project: Dict) -> str:
        """Get a human-readable display name for a project"""
        return f"{project['topic']} ({project['status']})" 
    
    def is_project_synced_to_drive(self, project_id: str) -> bool:
        """Check if a project has been synced to Google Drive"""
        project = self.get_project(project_id)
        if project:
            return project.get("drive_synced", "no") == "yes"
        return False
    
    def get_project_sync_status(self, project_id: str) -> Dict[str, str]:
        """Get the sync status of a project"""
        project = self.get_project(project_id)
        if not project:
            return {}
        
        return {
            "project_id": project_id,
            "drive_synced": project.get("drive_synced", "no"),
            "last_sync": project.get("last_sync", ""),
            "drive_folder_id": project.get("drive_folder_id", "")
        } 