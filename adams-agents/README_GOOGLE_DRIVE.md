# Google Drive Integration - Adams Agents

## Overview

The Google Drive integration allows you to automatically upload your generated content (scripts, outlines, and audio files) to Google Drive for easy access, sharing, and collaboration.

## Features

- **Automatic Upload**: Upload entire projects with one command
- **Organized Structure**: Creates logical folder hierarchies in Google Drive
- **File Management**: Handles scripts, outlines, and audio files separately
- **Authentication**: Secure OAuth2 authentication with token persistence
- **Error Handling**: Robust error handling and user feedback

## Quick Start

### 1. Setup Google Drive API
```bash
# Follow the detailed setup guide
# GOOGLE_DRIVE_SETUP.md
```

### 2. Configure Environment
```bash
# Add to your .env file

# Google Drive Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Optional: Customize Google Drive folder names
GOOGLE_DRIVE_ROOT_FOLDER=Your Custom Root Name
GOOGLE_DRIVE_SCRIPTS_FOLDER=Documentation
GOOGLE_DRIVE_AUDIO_FOLDER=Media Files

# OpenAI Configuration (for content generation)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini Configuration (for script processing)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs Configuration (for audio generation)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
ELEVENLABS_SPEED=1.07
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Test Integration
```bash
python test_drive_integration.py
```

### 5. Upload Your Projects
```bash
# Upload a specific project
python cli.py upload_to_drive "Your Project Topic"

# Or use project ID
python cli.py upload_to_drive "project-id-here"

# Use a custom root folder (existing Google Drive folder)
python cli.py upload_to_drive "Your Project Topic" --root-folder-id 1ABCdefGHIjklMNOpqrsTUVwxyz123456
```

### 6. List Available Root Folders
```bash
# See what folders are available to use as root
python cli.py list_drive_folders
```

## Command Reference

### `upload_to_drive`
Uploads all project files to Google Drive.

```bash
python cli.py upload_to_drive <project_identifier>
```

**Arguments:**
- `project_identifier`: Project ID or topic name

**Options:**
- `--root-folder-id` or `-r`: Use an existing Google Drive folder as the root instead of creating a new one

**What it uploads:**
- `script.txt` → Scripts folder  
- `script_cleaned.txt` → Scripts folder
- All `.mp3` files → Audio folder

**Output:**
- Creates organized folder structure in Google Drive
- Provides direct links to uploaded folders
- Updates project metadata with sync status

## Folder Structure

```
YouTube Content/
├── [Project Name]/
│   ├── Scripts/
│   │   ├── script.txt
│   │   └── script_cleaned.txt
│   └── Audio/
│       ├── chunk_001.mp3
│       ├── chunk_002.mp3
│       └── ...
```

## Integration Points

The Google Drive integration is seamlessly integrated into the existing workflow:

1. **After Content Generation**: Next steps include upload commands
2. **Project Status**: Shows sync status in project details
3. **CLI Help**: Integrated help and command suggestions
4. **Error Handling**: Graceful fallbacks and user guidance

## Complete Workflow

### Prerequisites
Before starting, ensure you have all required API keys in your `.env` file:
- `GOOGLE_CREDENTIALS_PATH` - Google OAuth2 credentials
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API key  
- `ELEVENLABS_API_KEY` - ElevenLabs API key

### Content Creation & Upload
```bash
# 1. Create project
python cli.py create --topic "AI in Healthcare" --context "Medical applications"

# 2. Generate outline
python cli.py generate_outline "AI in Healthcare"

# 3. Generate script
python cli.py generate_script "AI in Healthcare"

# 4. Generate audio
python cli.py generate_audio "AI in Healthcare"

# 5. Upload to Google Drive (only script and audio files)
python cli.py upload_to_drive "AI in Healthcare"
```

**Note:** The upload command only uploads the essential content files:
- `script.txt` and `script_cleaned.txt` (Scripts folder)
- All generated `.mp3` audio files (Audio folder)

## Benefits

- **Accessibility**: Access your content from anywhere
- **Collaboration**: Share folders with team members
- **Backup**: Secure cloud storage for your projects
- **Organization**: Structured file management
- **Integration**: Seamless workflow integration

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check credentials file path
   - Delete `token.pickle` and re-authenticate
   - Verify Google Cloud Console setup

2. **Upload Errors**
   - Check file permissions
   - Verify internet connection
   - Check Google Drive storage space

3. **Missing Files**
   - Ensure project has generated content
   - Check file paths and permissions
   - Verify project structure

### Getting Help

- Run `python test_drive_integration.py` for diagnostics
- Check `GOOGLE_DRIVE_SETUP.md` for detailed setup
- Review error messages in CLI output
- Check Google Cloud Console for API errors

### Common Environment Variable Issues

1. **Missing API Keys**
   - Ensure all required keys are in your `.env` file
   - Check that the file is named exactly `.env` (not `.env.txt`)
   - Verify no extra spaces or quotes around the values

2. **File Path Issues**
   - Use absolute paths for `GOOGLE_CREDENTIALS_PATH`
   - Ensure the credentials file exists and is readable
   - Check file permissions

3. **API Key Format**
   - OpenAI keys start with `sk-`
   - Google Gemini keys are typically long alphanumeric strings
   - ElevenLabs keys are also long alphanumeric strings

## Security

- OAuth2 authentication with minimal scope (`drive.file`)
- Local token storage in `token.pickle`
- No credentials stored in code
- Secure file uploads with proper permissions

## Future Enhancements

- Automatic sync after content generation
- File versioning and change tracking
- Team collaboration features
- Integration with other Google Workspace tools
- Webhook notifications for upload completion

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the detailed setup guide
3. Test with the diagnostic script
4. Check Google Cloud Console logs 