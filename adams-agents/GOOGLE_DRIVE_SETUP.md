# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for your Adams Agents project, allowing you to automatically upload generated scripts and audio files to Google Drive.

## Prerequisites

- Google account with access to Google Drive
- Python 3.8+ installed
- Access to Google Cloud Console

## Step 1: Enable Google Drive API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Drive API" and enable it
5. Navigate to "APIs & Services" > "Credentials"

## Step 2: Create OAuth 2.0 Credentials

1. Click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Choose "Desktop application" as the application type
3. Give it a name (e.g., "Adams Agents")
4. Click "Create"
5. Download the JSON credentials file

## Step 3: Configure Environment Variables

1. After downloading the credentials JSON file, open it and extract the values
2. Create or update your `.env` file with all required API keys:

**Required for Google Drive Integration:**
- `GOOGLE_CLIENT_ID`: Your Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth2 client secret

**Required for Content Generation (needed before upload):**
- `OPENAI_API_KEY`: Your OpenAI API key for content generation
- `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key for script processing
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key for audio generation
- `ELEVENLABS_VOICE_ID`: Voice ID for audio generation
- `ELEVENLABS_SPEED`: Speech speed (default: 1.07)

3. Extract values from your downloaded credentials JSON file:

Open the downloaded JSON file and look for these values:
```json
{
  "installed": {
    "client_id": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
    "client_secret": "GOCSPX-your_secret_here"
  }
}
```

4. Add the following to your `.env` file:

```bash
# Google Drive Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here

# OpenAI Configuration (for content generation)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini Configuration (for script processing)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs Configuration (for audio generation)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
ELEVENLABS_SPEED=1.07
```

**Important:** Replace `/path/to/your/credentials.json` with the actual path to your credentials file.

## Step 4: Get Required API Keys

Before you can generate and upload content, you'll need API keys for the AI services:

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env` file

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign in or create an account
3. Go to Profile → API Key
4. Copy the key and add it to your `.env` file

## Step 5: Install Dependencies

Install the required Google Drive packages:

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

Or install all dependencies at once:

```bash
pip install -r requirements.txt
```

## Step 6: First-Time Authentication

When you first run the `upload_to_drive` command:

1. A browser window will open
2. Sign in with your Google account
3. Grant permission to access your Google Drive
4. The authentication token will be saved locally in `token.pickle`

## Step 7: Test the Integration

1. Create a project and generate content:
   ```bash
   python cli.py create --topic "Test Topic" --context "Test Context"
   python cli.py generate_outline "Test Topic"
   python cli.py generate_script "Test Topic"
   python cli.py generate_audio "Test Topic"
   ```

2. Upload to Google Drive:
   ```bash
   python cli.py upload_to_drive "Test Topic"
   ```

## Folder Structure

The integration creates the following folder structure in Google Drive:

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

## Troubleshooting

### Authentication Issues

- **"Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET"**: Check that both environment variables are set in your `.env` file
- **"Failed to authenticate"**: Delete `token.pickle` and try again
- **"Permission denied"**: Ensure you've granted the necessary permissions in the browser

### API Quotas

- Google Drive API has daily quotas
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
- Consider enabling billing for higher quotas

### File Upload Issues

- **Large files**: Audio files may take time to upload
- **Network errors**: Check your internet connection
- **File size limits**: Google Drive has file size limits (5TB for most file types)

## Security Notes

- Keep your environment variables secure and never commit your `.env` file to version control
- The `token.pickle` file contains sensitive authentication tokens
- Consider using service account credentials for production use
- Regularly rotate your credentials

## Advanced Configuration

### Custom Folder Names

You can customize folder names by modifying the `DRIVE_FOLDERS` section in `config.py`:

```python
DRIVE_FOLDERS = {
    "root": "My Custom Root",
    "scripts": "Documentation",
    "audio": "Media Files"
}
```

### Service Account Authentication

For production use, consider using service account authentication:

1. Create a service account in Google Cloud Console
2. Download the service account key JSON file
3. Share the target Google Drive folder with the service account email
4. Extract the client ID and secret from the JSON file and set them as environment variables

## Support

If you encounter issues:

1. Check the error messages in the CLI output
2. Verify your credentials and permissions
3. Check the Google Cloud Console for API errors
4. Ensure all dependencies are properly installed

## Next Steps

Once Google Drive integration is working:

1. Automate uploads after content generation
2. Set up team sharing for collaborative projects
3. Implement file versioning and backup strategies
4. Consider integrating with other Google Workspace tools 