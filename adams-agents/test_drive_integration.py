#!/usr/bin/env python3
"""
Test script for Google Drive integration
Run this to verify that your Google Drive setup is working correctly
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_google_drive_setup():
    """Test the Google Drive integration setup"""
    print("🔍 Testing Google Drive Integration Setup...")
    print("=" * 50)
    
    # Check environment variables
    print("\n1. Environment Variables:")
    
    # Check Google Drive credentials
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if google_client_id and google_client_secret:
        print(f"   ✓ GOOGLE_CLIENT_ID: Set")
        print(f"   ✓ GOOGLE_CLIENT_SECRET: Set")
    else:
        missing = []
        if not google_client_id:
            missing.append("GOOGLE_CLIENT_ID")
        if not google_client_secret:
            missing.append("GOOGLE_CLIENT_SECRET")
        print(f"   ✗ Missing: {', '.join(missing)}")
        print("   Please add these to your .env file")
        return False
    
    # Check other required API keys
    required_keys = {
        "OPENAI_API_KEY": "OpenAI API key for content generation",
        "GOOGLE_GEMINI_API_KEY": "Google Gemini API key for script processing",
        "ELEVENLABS_API_KEY": "ElevenLabs API key for audio generation"
    }
    
    missing_keys = []
    for key, description in required_keys.items():
        if os.getenv(key):
            print(f"   ✓ {key}: Set")
        else:
            print(f"   ✗ {key}: Not set - {description}")
            missing_keys.append(key)
    
    if missing_keys:
        print(f"\n   ⚠ Missing API keys: {', '.join(missing_keys)}")
        print("   These are required for content generation before upload")
        print("   Add them to your .env file to complete the setup")
    
    # Check if required packages are installed
    print("\n2. Required Packages:")
    required_packages = [
        "google.auth",
        "google.auth.oauthlib", 
        "google.auth.httplib2",
        "googleapiclient"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✓ {package}")
        except ImportError:
            print(f"   ✗ {package} - not installed")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n   Install missing packages with:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    # Test Google Drive manager initialization
    print("\n3. Google Drive Manager:")
    try:
        from utils.google_drive import GoogleDriveManager
        
        # Try to initialize (this will test authentication)
        print("   Testing authentication...")
        drive_manager = GoogleDriveManager()
        print("   ✓ Google Drive Manager initialized successfully")
        
        # Test folder operations
        print("   Testing folder operations...")
        test_folder_id = drive_manager.get_or_create_folder("Test Folder")
        print(f"   ✓ Test folder created/accessed: {test_folder_id}")
        
        # Clean up test folder
        try:
            drive_manager.service.files().delete(fileId=test_folder_id).execute()
            print("   ✓ Test folder cleaned up")
        except:
            print("   ⚠ Could not clean up test folder (this is okay)")
        
        return True
        
    except Exception as e:
        print(f"   ✗ Failed to initialize Google Drive Manager: {str(e)}")
        return False

def test_project_structure():
    """Test the project structure for Google Drive integration"""
    print("\n4. Project Structure:")
    
    # Check if projects directory exists
    projects_dir = Path("projects")
    if projects_dir.exists():
        print(f"   ✓ Projects directory exists: {projects_dir}")
        
        # Check for existing projects
        project_dirs = [d for d in projects_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
        if project_dirs:
            print(f"   ✓ Found {len(project_dirs)} project(s)")
            
            # Check one project for required files
            for project_dir in project_dirs[:1]:  # Check first project
                print(f"   Checking project: {project_dir.name}")
                
                required_files = ["outline.txt", "script.txt", "audio"]
                for file_name in required_files:
                    file_path = project_dir / file_name
                    if file_path.exists():
                        if file_path.is_dir():
                            audio_files = list(file_path.glob("*.mp3"))
                            print(f"     ✓ {file_name}: {len(audio_files)} audio files")
                        else:
                            print(f"     ✓ {file_name}")
                    else:
                        print(f"     ✗ {file_name} - not found")
        else:
            print("   ⚠ No projects found")
            print("   Create a project first with: python cli.py create --topic 'Test' --context 'Test'")
    else:
        print("   ✗ Projects directory not found")
        return False
    
    return True

def main():
    """Main test function"""
    print("🚀 Adams Agents - Google Drive Integration Test")
    print("=" * 60)
    
    # Run tests
    drive_test = test_google_drive_setup()
    project_test = test_project_structure()
    
    print("\n" + "=" * 60)
    print("📊 Test Results:")
    
    if drive_test and project_test:
        print("✅ All tests passed! Google Drive integration is ready.")
        print("\n🎯 Next steps:")
        print("1. Create a project: python cli.py create --topic 'Your Topic' --context 'Your Context'")
        print("2. Generate content: python cli.py generate_outline 'Your Topic'")
        print("3. Upload to Drive: python cli.py upload_to_drive 'Your Topic'")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        
        if not drive_test:
            print("\n🔧 Google Drive Setup Issues:")
            print("- Check your .env file configuration")
            print("- Verify your Google Cloud Console setup")
            print("- Install missing Python packages")
        
        if not project_test:
            print("\n🔧 Project Structure Issues:")
            print("- Create a test project first")
            print("- Ensure the projects directory exists")
    
    print("\n📚 For detailed setup instructions, see: GOOGLE_DRIVE_SETUP.md")

if __name__ == "__main__":
    main() 