import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI / OpenRouter Configuration
# Uses OpenRouter if OPENROUTER_API_KEY is set, otherwise falls back to OPENAI_API_KEY
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENAI_API_KEY = OPENROUTER_API_KEY or os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = "https://openrouter.ai/api/v1" if OPENROUTER_API_KEY else None
OPENAI_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o") if OPENROUTER_API_KEY else "gpt-4o"

# Google Gemini Configuration
GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")

# Serper Image Search Configuration
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

# Google Cloud TTS Configuration
GOOGLE_SERVICE_ACCOUNT_KEY = os.getenv("GOOGLE_SERVICE_ACCOUNT_KEY")
GOOGLE_CLOUD_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")

# ElevenLabs Configuration (deprecated - keeping for backward compatibility)
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "iP95p4xoKVk53GoZ742B")
ELEVENLABS_SPEED = float(os.getenv("ELEVENLABS_SPEED", "1.1"))

# Google Drive Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# Google Cloud TTS Voice Settings (Fixed to Puck voice)
GOOGLE_TTS_VOICE_SETTINGS = {
    "speaking_rate": float(os.getenv("GOOGLE_TTS_SPEAKING_RATE", "1.0")),
    "pitch": float(os.getenv("GOOGLE_TTS_PITCH", "0.0")),
    "volume_gain_db": float(os.getenv("GOOGLE_TTS_VOLUME_GAIN", "0.0")),
    "sample_rate": int(os.getenv("GOOGLE_TTS_SAMPLE_RATE", "24000")),
}

# Voice Settings (deprecated - keeping for backward compatibility)
VOICE_SETTINGS = {
    "voice_id": ELEVENLABS_VOICE_ID,
    "speed": ELEVENLABS_SPEED,
    "stability": 0.5,
    "similarity_boost": 0.5
}

# Text Chunking Settings
CHUNK_SETTINGS = {
    "min_chunk_size": 1500,  # Increased from 1000
    "max_chunk_size": 3000,  # Increased from 2000
    "prefer_sentence_boundaries": True,
    "target_chunk_count": "5-8"  # AI will aim for this range
}

# Google Drive Folder Structure
DRIVE_FOLDERS = {
    "root": os.getenv("GOOGLE_DRIVE_ROOT_FOLDER", "YouTube Content"),
    "scripts": os.getenv("GOOGLE_DRIVE_SCRIPTS_FOLDER", "Scripts"),
    "audio": os.getenv("GOOGLE_DRIVE_AUDIO_FOLDER", "Audio")
}

# Topic Queue Settings
TOPIC_QUEUE_FILE = os.getenv(
    "TOPIC_QUEUE_FILE",
    os.path.join(os.path.dirname(__file__), "topic_queue.json"),
)

# Content Generation Settings
CONTENT_SETTINGS = {
    "max_script_length": 5000,  # words
    "target_script_length": 3000,  # words
    "outline_sections": 5  # default number of sections
} 