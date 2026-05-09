#!/usr/bin/env python3
"""
Test script for Google Cloud TTS implementation.
Run this to verify the TTS setup is working correctly.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from utils.google_tts import GoogleCloudTTS
from config import GOOGLE_CLOUD_PROJECT_ID, GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_TTS_VOICE_SETTINGS

async def test_google_tts():
    """Test the Google Cloud TTS implementation."""
    print("🧪 Testing Google Cloud TTS Implementation")
    print("=" * 50)
    
    # Check configuration
    print(f"📋 Configuration Check:")
    print(f"   Project ID: {'✅ Set' if GOOGLE_CLOUD_PROJECT_ID else '❌ Missing'}")
    print(f"   Service Account Key: {'✅ Set' if GOOGLE_SERVICE_ACCOUNT_KEY else '❌ Missing'}")
    print(f"   Voice Style: {GOOGLE_TTS_VOICE_SETTINGS['voice_style']}")
    print(f"   Speaking Rate: {GOOGLE_TTS_VOICE_SETTINGS['speaking_rate']}")
    print()
    
    if not GOOGLE_CLOUD_PROJECT_ID or not GOOGLE_SERVICE_ACCOUNT_KEY:
        print("❌ Missing required configuration. Please set:")
        if not GOOGLE_CLOUD_PROJECT_ID:
            print("   - GOOGLE_CLOUD_PROJECT_ID")
        if not GOOGLE_SERVICE_ACCOUNT_KEY:
            print("   - GOOGLE_SERVICE_ACCOUNT_KEY")
        return False
    
    try:
        # Initialize TTS client
        print("🚀 Initializing Google Cloud TTS client...")
        tts_client = GoogleCloudTTS(
            project_id=GOOGLE_CLOUD_PROJECT_ID,
            service_account_key=GOOGLE_SERVICE_ACCOUNT_KEY
        )
        print("✅ TTS client initialized successfully")
        print()
        
        # Test text
        test_text = """
        Hello! This is a test of the Google Cloud Text-to-Speech system. 
        We are testing the new Chirp 3 HD voices which provide excellent quality 
        for educational content. This audio generation system is now integrated 
        with the Adams Agents content creation pipeline.
        """
        
        print(f"🎤 Testing audio generation...")
        print(f"   Text length: {len(test_text)} characters")
        print(f"   Voice: {GOOGLE_TTS_VOICE_SETTINGS['voice_style']}")
        print()
        
        # Generate audio
        audio_buffer = await tts_client.generate_long_audio(
            text=test_text,
            voice_style=GOOGLE_TTS_VOICE_SETTINGS['voice_style'],
            audio_settings={
                "speaking_rate": GOOGLE_TTS_VOICE_SETTINGS['speaking_rate'],
                "pitch": GOOGLE_TTS_VOICE_SETTINGS['pitch'],
                "volume_gain_db": GOOGLE_TTS_VOICE_SETTINGS['volume_gain_db'],
                "sample_rate_hertz": GOOGLE_TTS_VOICE_SETTINGS['sample_rate'],
                "audio_encoding": GOOGLE_TTS_VOICE_SETTINGS['audio_encoding']
            }
        )
        
        print(f"✅ Audio generated successfully!")
        print(f"   Audio size: {len(audio_buffer)} bytes")
        print(f"   Audio duration: ~{len(audio_buffer) / (24000 * 2):.1f} seconds (estimated)")
        print()
        
        # Save test audio file
        test_output_dir = project_root / "test_output"
        test_output_dir.mkdir(exist_ok=True)
        
        test_audio_file = test_output_dir / "test_google_tts_audio.wav"
        with open(test_audio_file, 'wb') as f:
            f.write(audio_buffer)
        
        print(f"💾 Test audio saved to: {test_audio_file}")
        print()
        
        # Test voice configuration
        print("🎭 Testing voice configurations...")
        voice_configs = ['chirp3-female', 'chirp3-male']
        
        for voice_style in voice_configs:
            config = tts_client.get_voice_config(voice_style)
            print(f"   {voice_style}: {config['name']} ({config['ssml_gender']})")
        
        print()
        print("🎉 All tests passed! Google Cloud TTS is ready to use.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function."""
    print("Adams Agents - Google Cloud TTS Test")
    print("=" * 40)
    print()
    
    # Run the async test
    success = asyncio.run(test_google_tts())
    
    print()
    if success:
        print("✅ Test completed successfully!")
        print("🚀 You can now use Google Cloud TTS in your content generation pipeline.")
    else:
        print("❌ Test failed. Please check your configuration and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()


