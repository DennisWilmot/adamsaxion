import os
import json
from pathlib import Path
from typing import List, Dict, Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
import pickle
from config import DRIVE_FOLDERS

class GoogleDriveManager:
    """Manages Google Drive operations for project files"""
    
    # If modifying these scopes, delete the file token.pickle.
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    
    def __init__(self):
        self.service = None
        self.folder_cache = {}
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Drive API using environment variables"""
        creds = None
        
        # The file token.pickle stores the user's access and refresh tokens
        token_path = Path("token.pickle")
        
        if token_path.exists():
            with open(token_path, 'rb') as token:
                creds = pickle.load(token)
        
        # If there are no (valid) credentials available, let the user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # Get OAuth2 credentials from environment variables
                client_id = os.getenv("GOOGLE_CLIENT_ID")
                client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
                
                if not client_id or not client_secret:
                    raise ValueError("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set in environment variables.")
                
                # Create credentials from environment variables
                client_config = {
                    "installed": {
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                        "redirect_uris": ["http://localhost"]
                    }
                }
                
                flow = InstalledAppFlow.from_client_config(client_config, self.SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open(token_path, 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('drive', 'v3', credentials=creds)
    
    def create_folder(self, name: str, parent_id: Optional[str] = None) -> str:
        """Create a folder in Google Drive"""
        folder_metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        
        if parent_id:
            folder_metadata['parents'] = [parent_id]
        
        folder = self.service.files().create(
            body=folder_metadata,
            fields='id'
        ).execute()
        
        folder_id = folder.get('id')
        self.folder_cache[name] = folder_id
        return folder_id
    
    def get_or_create_folder(self, name: str, parent_id: Optional[str] = None) -> str:
        """Get existing folder or create new one"""
        # Check cache first
        if name in self.folder_cache:
            return self.folder_cache[name]
        
        # Search for existing folder
        query = f"name='{name}' and mimeType='application/vnd.google-apps.folder'"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        else:
            query += " and 'root' in parents"
        
        results = self.service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name)'
        ).execute()
        
        files = results.get('files', [])
        
        if files:
            folder_id = files[0]['id']
            self.folder_cache[name] = folder_id
            return folder_id
        
        # Create new folder if not found
        return self.create_folder(name, parent_id)
    
    def upload_file(self, file_path: str, folder_id: str, filename: Optional[str] = None) -> str:
        """Upload a file to Google Drive"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if filename is None:
            filename = os.path.basename(file_path)
        
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(file_path, resumable=True)
        
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, size'
        ).execute()
        
        return file.get('id')
    
    def upload_project_files(self, project_dir: Path, project_name: str, custom_root_folder_id: Optional[str] = None) -> Dict[str, str]:
        """Upload all project files to Google Drive"""
        if not self.service:
            raise RuntimeError("Google Drive service not initialized")
        
        # Use custom root folder ID if provided, otherwise create/get default root folder
        if custom_root_folder_id:
            root_folder_id = custom_root_folder_id
            # Verify the folder exists and we have access
            try:
                folder = self.service.files().get(fileId=custom_root_folder_id).execute()
                print(f"Using existing root folder: {folder['name']}")
            except Exception as e:
                raise ValueError(f"Custom root folder ID {custom_root_folder_id} not accessible: {str(e)}")
        else:
            # Create or get default root folder
            root_folder_id = self.get_or_create_folder(DRIVE_FOLDERS["root"])
        
        # Create or get project folder
        project_folder_id = self.get_or_create_folder(project_name, root_folder_id)
        
        # Create subfolders
        scripts_folder_id = self.get_or_create_folder(DRIVE_FOLDERS["scripts"], project_folder_id)
        audio_folder_id = self.get_or_create_folder(DRIVE_FOLDERS["audio"], project_folder_id)
        
        uploaded_files = {}
        
        # Upload script files (only essential content files)
        script_files = [
            "script.txt",
            "script_cleaned.txt"
        ]
        
        for script_file in script_files:
            script_path = project_dir / script_file
            if script_path.exists():
                try:
                    file_id = self.upload_file(str(script_path), scripts_folder_id)
                    uploaded_files[script_file] = file_id
                except Exception as e:
                    print(f"Warning: Failed to upload {script_file}: {e}")
        
        # Upload audio files
        audio_dir = project_dir / "audio"
        if audio_dir.exists():
            audio_files = list(audio_dir.glob("*.mp3"))
            for audio_file in audio_files:
                try:
                    file_id = self.upload_file(str(audio_file), audio_folder_id)
                    uploaded_files[audio_file.name] = file_id
                except Exception as e:
                    print(f"Warning: Failed to upload {audio_file.name}: {e}")
        
        return {
            'project_folder_id': project_folder_id,
            'scripts_folder_id': scripts_folder_id,
            'audio_folder_id': audio_folder_id,
            'uploaded_files': uploaded_files
        }
    
    def get_folder_url(self, folder_id: str) -> str:
        """Get the web URL for a Google Drive folder"""
        return f"https://drive.google.com/drive/folders/{folder_id}"
    
    def list_files_in_folder(self, folder_id: str) -> List[Dict]:
        """List all files in a Google Drive folder"""
        results = self.service.files().list(
            q=f"'{folder_id}' in parents",
            spaces='drive',
            fields='files(id, name, mimeType, size, createdTime)'
        ).execute()
        
        return results.get('files', [])
    
    def delete_file(self, file_id: str):
        """Delete a file from Google Drive"""
        try:
            self.service.files().delete(fileId=file_id).execute()
            return True
        except HttpError as e:
            print(f"Error deleting file: {e}")
            return False 