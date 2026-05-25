"""
Google Cloud Text-to-Speech utility for generating high-quality audio from text.
Uses the Long Audio Synthesis API with Chirp 3 HD voices for optimal quality.
All output is MP3 regardless of which underlying API is used.
"""

import io
import json
import os
import asyncio
from typing import Optional, Dict, Any, Union
from google.cloud import texttospeech
from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError
import logging

logger = logging.getLogger(__name__)


def _convert_linear16_to_mp3(pcm_bytes: bytes, sample_rate: int = 24000) -> bytes:
    """Convert raw LINEAR16 PCM bytes to MP3 format using pydub."""
    from pydub import AudioSegment

    audio = AudioSegment(
        data=pcm_bytes,
        sample_width=2,
        frame_rate=sample_rate,
        channels=1,
    )
    buf = io.BytesIO()
    audio.export(buf, format="mp3", bitrate="192k")
    return buf.getvalue()


def get_mp3_duration(mp3_bytes: bytes) -> float:
    """Return duration in seconds for an in-memory MP3 buffer."""
    from pydub import AudioSegment

    audio = AudioSegment.from_mp3(io.BytesIO(mp3_bytes))
    return len(audio) / 1000.0


class GoogleCloudTTS:
    """Google Cloud Text-to-Speech client with Long Audio Synthesis support."""

    VOICE_NAME = "en-US-Chirp3-HD-Puck"
    VOICE_LANGUAGE = "en-US"

    def __init__(self, project_id: str, service_account_key: Optional[str] = None):
        self.project_id = project_id
        self.credentials = None

        try:
            if service_account_key:
                from google.oauth2 import service_account

                credentials_info = json.loads(service_account_key)
                if credentials_info.get('private_key') and '\\n' in credentials_info['private_key']:
                    credentials_info['private_key'] = credentials_info['private_key'].replace('\\n', '\n')

                self.credentials = service_account.Credentials.from_service_account_info(credentials_info)

                self.tts_client = texttospeech.TextToSpeechLongAudioSynthesizeClient(
                    credentials=self.credentials
                )
                self.storage_client = storage.Client(
                    credentials=self.credentials,
                    project=project_id,
                )
            else:
                self.tts_client = texttospeech.TextToSpeechLongAudioSynthesizeClient()
                self.storage_client = storage.Client()

            logger.info("Google Cloud TTS client initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud TTS client: {e}")
            raise

    def get_voice_config(self) -> Dict[str, Any]:
        """Return Puck voice configuration."""
        return {
            'language_code': self.VOICE_LANGUAGE,
            'name': self.VOICE_NAME,
            'ssml_gender': texttospeech.SsmlVoiceGender.MALE,
        }

    def convert_to_single_speaker(self, script: str) -> str:
        """Clean up script for single speaker TTS."""
        import re

        text = script
        text = re.sub(r'\*\*[^*]*\*\*', '', text)
        text = re.sub(r'\([^)]*\)', '', text)
        text = re.sub(r'\{[^}]*\}', '', text)
        text = re.sub(r'^\s*[A-Za-z][A-Za-z0-9 _-]{0,20}:\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    async def ensure_bucket_exists(self, bucket_name: str) -> None:
        """Ensure the specified GCS bucket exists."""
        try:
            bucket = self.storage_client.bucket(bucket_name)
            if not bucket.exists():
                bucket.create()
                logger.info(f"Created bucket: {bucket_name}")
        except GoogleCloudError as e:
            logger.error(f"Error creating bucket {bucket_name}: {e}")
            raise

    async def generate_long_audio(
        self,
        text: str,
        audio_settings: Optional[Dict[str, Any]] = None,
    ) -> bytes:
        """Generate audio, choosing the best API automatically.

        Short texts (< 1000 chars) use the standard API.
        Longer texts use the Long Audio Synthesis API.
        Always returns MP3 bytes.
        """
        try:
            logger.info(f"Generating audio for script length: {len(text)} characters")

            if len(text) < 1000:
                logger.info("Using standard TTS API for shorter text")
                return await self.generate_standard_audio(text, audio_settings)

            try:
                logger.info("Attempting Long Audio Synthesis API")

                single_speaker_text = self.convert_to_single_speaker(text)

                bucket_name = f"tts-long-audio-{self.project_id}"
                file_name = f"audio-{asyncio.get_event_loop().time()}.wav"

                await self.ensure_bucket_exists(bucket_name)

                voice_config = self.get_voice_config()

                defaults = {
                    "speaking_rate": 1.0,
                    "pitch": 0.0,
                    "volume_gain_db": 0.0,
                    "sample_rate_hertz": 24000,
                }
                if audio_settings:
                    defaults.update(audio_settings)

                sample_rate = defaults["sample_rate_hertz"]

                request = {
                    "parent": f"projects/{self.project_id}/locations/global",
                    "input": {"text": single_speaker_text},
                    "audio_config": {
                        "audio_encoding": texttospeech.AudioEncoding.LINEAR16,
                        "speaking_rate": defaults["speaking_rate"],
                        "pitch": defaults["pitch"],
                        "volume_gain_db": defaults["volume_gain_db"],
                        "sample_rate_hertz": sample_rate,
                    },
                    "voice": voice_config,
                    "output_gcs_uri": f"gs://{bucket_name}/{file_name}",
                }

                logger.info("Starting long audio synthesis...")
                operation = self.tts_client.synthesize_long_audio(request)

                logger.info("Waiting for long audio synthesis to complete...")
                response = operation.result()

                if not response:
                    raise Exception("No response returned from long audio synthesis")

                bucket = self.storage_client.bucket(bucket_name)
                blob = bucket.blob(file_name)
                pcm_bytes = blob.download_as_bytes()
                blob.delete()

                mp3_bytes = _convert_linear16_to_mp3(pcm_bytes, sample_rate=sample_rate)
                logger.info(f"Long audio generation completed. MP3 size: {len(mp3_bytes)} bytes")
                return mp3_bytes

            except Exception as e:
                logger.warning(f"Long Audio API failed: {e}. Falling back to standard TTS API.")
                return await self.generate_standard_audio(text, audio_settings)

        except Exception as e:
            logger.error(f"Error generating audio: {e}")
            raise

    async def generate_standard_audio(
        self,
        text: str,
        audio_settings: Optional[Dict[str, Any]] = None,
    ) -> bytes:
        """Generate audio using the standard TTS API. Always returns MP3 bytes."""
        try:
            standard_client = texttospeech.TextToSpeechClient(credentials=self.credentials)

            single_speaker_text = self.convert_to_single_speaker(text)

            voice_config = self.get_voice_config()

            defaults = {
                "speaking_rate": 1.0,
                "pitch": 0.0,
                "volume_gain_db": 0.0,
                "sample_rate_hertz": 24000,
            }
            if audio_settings:
                defaults.update(audio_settings)

            synthesis_input = texttospeech.SynthesisInput(text=single_speaker_text)

            voice = texttospeech.VoiceSelectionParams(
                language_code=voice_config['language_code'],
                name=voice_config['name'],
                ssml_gender=voice_config['ssml_gender'],
            )

            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=defaults["speaking_rate"],
                pitch=defaults["pitch"],
                volume_gain_db=defaults["volume_gain_db"],
                sample_rate_hertz=defaults["sample_rate_hertz"],
            )

            response = standard_client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config,
            )

            logger.info(f"Standard audio generation completed. File size: {len(response.audio_content)} bytes")
            return response.audio_content

        except GoogleCloudError as e:
            logger.error(f"Google Cloud error during standard audio generation: {e}")
            raise
        except Exception as e:
            logger.error(f"Error generating standard audio: {e}")
            raise

    async def generate_audio_with_retry(
        self,
        text: str,
        audio_settings: Optional[Dict[str, Any]] = None,
        max_retries: int = 3,
    ) -> bytes:
        """Generate audio with exponential-backoff retry.

        Retries up to *max_retries* times on failure (waits 1s, 2s, 4s …).
        Always returns MP3 bytes on success; raises the last exception on
        exhaustion.
        """
        last_error: Optional[Exception] = None
        for attempt in range(max_retries + 1):
            try:
                return await self.generate_long_audio(text, audio_settings)
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    wait = 2 ** attempt
                    logger.warning(
                        f"TTS attempt {attempt + 1}/{max_retries + 1} failed: {e}. "
                        f"Retrying in {wait}s…"
                    )
                    await asyncio.sleep(wait)
        raise last_error  # type: ignore[misc]


# ---------------------------------------------------------------------------
# Convenience wrapper
# ---------------------------------------------------------------------------

async def generate_tts_audio(
    text: str,
    project_id: str,
    service_account_key: Optional[str] = None,
    use_long_audio: bool = True,
    audio_settings: Optional[Dict[str, Any]] = None,
) -> bytes:
    """Convenience function to generate TTS audio. Returns MP3 bytes."""
    tts_client = GoogleCloudTTS(project_id, service_account_key)

    if use_long_audio and len(text) > 1000:
        return await tts_client.generate_long_audio(text, audio_settings)
    else:
        return await tts_client.generate_standard_audio(text, audio_settings)
