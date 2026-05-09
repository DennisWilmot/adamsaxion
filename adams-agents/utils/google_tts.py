"""
Google Cloud Text-to-Speech utility for generating high-quality audio from text.
Uses the Long Audio Synthesis API with Chirp 3 HD voices for optimal quality.
"""

import json
import os
import asyncio
from typing import Optional, Dict, Any, Union
from google.cloud import texttospeech
from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError
import logging

logger = logging.getLogger(__name__)


class GoogleCloudTTS:
    """Google Cloud Text-to-Speech client with Long Audio Synthesis support."""
    
    def __init__(self, project_id: str, service_account_key: Optional[str] = None):
        """
        Initialize Google Cloud TTS client.
        
        Args:
            project_id: Google Cloud project ID
            service_account_key: Service account JSON key (optional, will use default auth if not provided)
        """
        self.project_id = project_id
        self.credentials = None
        
        try:
            if service_account_key:
                from google.oauth2 import service_account
                
                credentials_info = json.loads(service_account_key)
                # Handle private key formatting
                if credentials_info.get('private_key') and '\\n' in credentials_info['private_key']:
                    credentials_info['private_key'] = credentials_info['private_key'].replace('\\n', '\n')
                
                # Create credentials object
                self.credentials = service_account.Credentials.from_service_account_info(credentials_info)
                
                self.tts_client = texttospeech.TextToSpeechLongAudioSynthesizeClient(
                    credentials=self.credentials
                )
                self.storage_client = storage.Client(
                    credentials=self.credentials,
                    project=project_id
                )
            else:
                # Use default authentication (ADC - Application Default Credentials)
                self.tts_client = texttospeech.TextToSpeechLongAudioSynthesizeClient()
                self.storage_client = storage.Client()
                
            logger.info("Google Cloud TTS client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud TTS client: {e}")
            raise
    
    def get_voice_config(self, voice_style: str) -> Dict[str, Any]:
        """
        Get voice configuration for the specified voice style.
        
        Args:
            voice_style: Voice style ('chirp3-female', 'chirp3-male')
            
        Returns:
            Dictionary containing voice configuration
        """
        # Only Puck voice for now
        puck_voice = {
            'language_code': 'en-US',
            'name': 'en-US-Chirp3-HD-Puck',
            'ssml_gender': texttospeech.SsmlVoiceGender.MALE
        }
        
        return puck_voice
    
    def convert_to_single_speaker(self, script: str) -> str:
        """
        Clean up script for single speaker TTS.
        
        Args:
            script: Original script text
            
        Returns:
            Cleaned script text
        """
        import re
        
        single_speaker_script = script
        # Strip markdown bold/italics
        single_speaker_script = re.sub(r'\*\*[^*]*\*\*', '', single_speaker_script)
        # Remove any content inside parentheses or curly braces (keep [] tone tags)
        single_speaker_script = re.sub(r'\([^)]*\)', '', single_speaker_script)
        single_speaker_script = re.sub(r'\{[^}]*\}', '', single_speaker_script)
        # Remove common speaker labels at line starts (e.g., "Host:", "SA:")
        single_speaker_script = re.sub(r'^\s*[A-Za-z][A-Za-z0-9 _-]{0,20}:\s+', '', single_speaker_script, flags=re.MULTILINE)
        single_speaker_script = re.sub(r'\n\s*\n', '\n\n', single_speaker_script)  # Clean up multiple newlines
        single_speaker_script = single_speaker_script.strip()
        
        return single_speaker_script
    
    async def ensure_bucket_exists(self, bucket_name: str) -> None:
        """
        Ensure the specified bucket exists in Google Cloud Storage.
        
        Args:
            bucket_name: Name of the bucket to create if it doesn't exist
        """
        try:
            bucket = self.storage_client.bucket(bucket_name)
            if not bucket.exists():
                bucket.create()
                logger.info(f"Created bucket: {bucket_name}")
            else:
                logger.debug(f"Bucket {bucket_name} already exists")
        except GoogleCloudError as e:
            logger.error(f"Error creating bucket {bucket_name}: {e}")
            raise
    
    async def generate_long_audio(
        self, 
        text: str, 
        voice_style: str = 'chirp3-female',
        audio_settings: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate audio using the most appropriate API.
        Falls back to standard TTS if Long Audio API fails.
        """
        """
        Generate long audio using Google Cloud Text-to-Speech Long Audio Synthesis API.
        
        Args:
            text: Text to convert to speech
            voice_style: Voice style to use ('chirp3-female', 'chirp3-male')
            audio_settings: Audio configuration settings
            
        Returns:
            Audio data as bytes
        """
        try:
            logger.info(f"Generating audio for script length: {len(text)} characters")
            
            # For shorter texts, use standard TTS API (no billing required)
            if len(text) < 1000:
                logger.info("Using standard TTS API for shorter text")
                return await self.generate_standard_audio(text, voice_style, audio_settings)
            
            # Try Long Audio Synthesis API first
            try:
                logger.info("Attempting Long Audio Synthesis API")
                
                # Clean up script for single speaker
                single_speaker_text = self.convert_to_single_speaker(text)
                
                # Use Long Audio Synthesis API
                bucket_name = f"tts-long-audio-{self.project_id}"
                file_name = f"audio-{asyncio.get_event_loop().time()}.wav"
                
                # Create bucket if it doesn't exist
                await self.ensure_bucket_exists(bucket_name)
                
                # Get voice configuration
                voice_config = self.get_voice_config(voice_style)
                
                # Default audio settings
                default_audio_settings = {
                    "audio_encoding": "LINEAR16",
                    "speaking_rate": 1.0,
                    "pitch": 0.0,
                    "volume_gain_db": 0.0,
                    "sample_rate_hertz": 24000,
                }
                
                # Merge with provided settings
                if audio_settings:
                    default_audio_settings.update(audio_settings)
                
                # Configure the long audio synthesis request
                request = {
                    "parent": f"projects/{self.project_id}/locations/global",
                    "input": {
                        "text": single_speaker_text
                    },
                    "audio_config": {
                        "audio_encoding": getattr(
                            texttospeech.AudioEncoding, 
                            default_audio_settings["audio_encoding"]
                        ),
                        "speaking_rate": default_audio_settings["speaking_rate"],
                        "pitch": default_audio_settings["pitch"],
                        "volume_gain_db": default_audio_settings["volume_gain_db"],
                        "sample_rate_hertz": default_audio_settings["sample_rate_hertz"],
                    },
                    "voice": voice_config,
                    "output_gcs_uri": f"gs://{bucket_name}/{file_name}",
                }
                
                logger.info("Starting long audio synthesis...")
                operation = self.tts_client.synthesize_long_audio(request)
                
                # Wait for the operation to complete
                logger.info("Waiting for long audio synthesis to complete...")
                response = operation.result()
                
                if not response:
                    raise Exception("No response returned from long audio synthesis")
                
                # Download the generated audio file from Cloud Storage
                bucket = self.storage_client.bucket(bucket_name)
                blob = bucket.blob(file_name)
                audio_buffer = blob.download_as_bytes()
                
                # Clean up the temporary file
                blob.delete()
                
                logger.info(f"Long audio generation completed. File size: {len(audio_buffer)} bytes")
                return audio_buffer
                
            except Exception as e:
                logger.warning(f"Long Audio API failed: {e}. Falling back to standard TTS API.")
                # Fallback to standard TTS API
                return await self.generate_standard_audio(text, voice_style, audio_settings)
            
        except Exception as e:
            logger.error(f"Error generating audio: {e}")
            raise
    
    async def generate_standard_audio(
        self, 
        text: str, 
        voice_style: str = 'chirp3-female',
        audio_settings: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate audio using the standard Text-to-Speech API (for shorter texts).
        
        Args:
            text: Text to convert to speech
            voice_style: Voice style to use ('chirp3-female', 'chirp3-male')
            audio_settings: Audio configuration settings
            
        Returns:
            Audio data as bytes
        """
        try:
            # Use standard TTS client for shorter texts
            standard_client = texttospeech.TextToSpeechClient(credentials=self.credentials)
            
            # Clean up script for single speaker
            single_speaker_text = self.convert_to_single_speaker(text)
            
            # Get voice configuration
            voice_config = self.get_voice_config(voice_style)
            
            # Default audio settings
            default_audio_settings = {
                "audio_encoding": "MP3",
                "speaking_rate": 1.0,
                "pitch": 0.0,
                "volume_gain_db": 0.0,
                "sample_rate_hertz": 24000,
            }
            
            # Merge with provided settings
            if audio_settings:
                default_audio_settings.update(audio_settings)
            
            # Configure the synthesis request
            synthesis_input = texttospeech.SynthesisInput(text=single_speaker_text)
            
            voice = texttospeech.VoiceSelectionParams(
                language_code=voice_config['language_code'],
                name=voice_config['name'],
                ssml_gender=voice_config['ssml_gender']
            )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=getattr(
                    texttospeech.AudioEncoding, 
                    default_audio_settings["audio_encoding"]
                ),
                speaking_rate=default_audio_settings["speaking_rate"],
                pitch=default_audio_settings["pitch"],
                volume_gain_db=default_audio_settings["volume_gain_db"],
                sample_rate_hertz=default_audio_settings["sample_rate_hertz"]
            )
            
            # Perform the text-to-speech request
            response = standard_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            logger.info(f"Standard audio generation completed. File size: {len(response.audio_content)} bytes")
            return response.audio_content
            
        except GoogleCloudError as e:
            logger.error(f"Google Cloud error during standard audio generation: {e}")
            raise
        except Exception as e:
            logger.error(f"Error generating standard audio: {e}")
            raise


# Convenience function for easy integration
async def generate_tts_audio(
    text: str, 
    project_id: str,
    service_account_key: Optional[str] = None,
    voice_style: str = 'chirp3-female',
    use_long_audio: bool = True,
    audio_settings: Optional[Dict[str, Any]] = None
) -> bytes:
    """
    Convenience function to generate TTS audio.
    
    Args:
        text: Text to convert to speech
        project_id: Google Cloud project ID
        service_account_key: Service account JSON key (optional)
        voice_style: Voice style to use ('chirp3-female', 'chirp3-male')
        use_long_audio: Whether to use Long Audio API (recommended for longer texts)
        audio_settings: Audio configuration settings
        
    Returns:
        Audio data as bytes
    """
    tts_client = GoogleCloudTTS(project_id, service_account_key)
    
    if use_long_audio and len(text) > 1000:  # Use long audio for texts longer than 1000 characters
        return await tts_client.generate_long_audio(text, voice_style, audio_settings)
    else:
        return await tts_client.generate_standard_audio(text, voice_style, audio_settings)
