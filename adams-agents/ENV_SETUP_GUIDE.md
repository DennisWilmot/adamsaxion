# Environment Variables Setup Guide

Since you don't have a `.env` file yet, you need to create one with the following configuration. Create a file named `.env` in your project root directory with the content below.

## Required Environment Variables

Create a file named `.env` in your project root (`/Users/denniswilmot/adams-agents/.env`) with the following content:

```bash
# =============================================================================
# OPENAI CONFIGURATION
# =============================================================================
OPENAI_API_KEY=your_openai_api_key_here

# =============================================================================
# GOOGLE GEMINI CONFIGURATION
# =============================================================================
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

# =============================================================================
# GOOGLE CLOUD TEXT-TO-SPEECH CONFIGURATION (NEW - RECOMMENDED)
# =============================================================================
# Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id

# Service Account JSON Key (paste the entire JSON as a single line string)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Optional: Customize TTS voice settings
GOOGLE_TTS_VOICE_STYLE=chirp3-female
GOOGLE_TTS_SPEAKING_RATE=1.0
GOOGLE_TTS_PITCH=0.0
GOOGLE_TTS_VOLUME_GAIN=0.0
GOOGLE_TTS_SAMPLE_RATE=24000

# =============================================================================
# ELEVENLABS CONFIGURATION (DEPRECATED - KEEPING FOR BACKWARD COMPATIBILITY)
# =============================================================================
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=iP95p4xoKVk53GoZ742B
ELEVENLABS_SPEED=1.1

# =============================================================================
# GOOGLE DRIVE CONFIGURATION
# =============================================================================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# =============================================================================
# GOOGLE DRIVE FOLDER STRUCTURE (OPTIONAL)
# =============================================================================
GOOGLE_DRIVE_ROOT_FOLDER=YouTube Content
GOOGLE_DRIVE_SCRIPTS_FOLDER=Scripts
GOOGLE_DRIVE_AUDIO_FOLDER=Audio
```

## Setup Instructions

### 1. Create the .env file
```bash
cd /Users/denniswilmot/adams-agents
touch .env
```

Then copy the content above into the `.env` file and replace the placeholder values.

### 2. Get Required API Keys

#### OpenAI API Key
- Visit https://platform.openai.com/api-keys
- Create a new secret key
- Replace `your_openai_api_key_here` with your actual key

#### Google Gemini API Key
- Visit https://makersuite.google.com/app/apikey
- Create a new API key
- Replace `your_google_gemini_api_key_here` with your actual key

#### Google Cloud TTS Setup (Recommended)
1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Enable the following APIs:
   - Text-to-Speech API
   - Cloud Storage API
4. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Create Service Account
   - Grant Editor role
   - Create and download JSON key
5. Replace `your_google_cloud_project_id` with your project ID
6. Replace the `GOOGLE_SERVICE_ACCOUNT_KEY` value with the entire JSON content from the downloaded key file

#### ElevenLabs API Key (Optional - for backward compatibility)
- Visit https://elevenlabs.io
- Sign up and get your API key
- Replace `your_elevenlabs_api_key_here` with your actual key

#### Google Drive Setup (Optional)
1. Go to https://console.cloud.google.com
2. Enable Google Drive API
3. Create OAuth 2.0 credentials
4. Replace `your_google_client_id_here` and `your_google_client_secret_here` with your credentials

### 3. Test Your Setup

After creating your `.env` file with the proper values, test the setup:

```bash
# Test Google Cloud TTS setup
python test_google_tts.py

# Test Google Drive integration
python test_drive_integration.py
```

## Important Notes

1. **Never commit your `.env` file to version control** - it contains sensitive information
2. **The `.env` file should be in your project root** (`/Users/denniswilmot/adams-agents/.env`)
3. **Google Cloud TTS is now the recommended audio generation method** - it's much cheaper and provides better quality
4. **ElevenLabs configuration is kept for backward compatibility** but you can remove it if you're not using it

## Current Status

Based on your current setup, you need to:

1. ✅ Create `.env` file (you don't have one yet)
2. ✅ Set up Google Cloud TTS (new requirement for the migration)
3. ✅ Configure other API keys as needed

The Google Cloud TTS setup is the most important for the audio generation migration we just implemented.


