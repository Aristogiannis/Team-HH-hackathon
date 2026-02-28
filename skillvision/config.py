import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (one level up from skillvision/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


@dataclass(frozen=True)
class Settings:
    google_api_key: str
    gemini_model: str
    voice_name: str
    frame_rate: float
    frame_resolution: int
    compression_trigger_tokens: int
    compression_target_tokens: int
    host: str
    port: int


def load_settings() -> Settings:
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY environment variable is required. "
            "Copy .env.template to .env and fill in your key."
        )
    return Settings(
        google_api_key=api_key,
        gemini_model=os.environ.get(
            "GEMINI_MODEL", "gemini-2.5-flash-native-audio-preview-12-2025"
        ),
        voice_name=os.environ.get("VOICE_NAME", "Kore"),
        frame_rate=float(os.environ.get("FRAME_RATE", "1.0")),
        frame_resolution=int(os.environ.get("FRAME_RESOLUTION", "768")),
        compression_trigger_tokens=int(
            os.environ.get("COMPRESSION_TRIGGER_TOKENS", "25600")
        ),
        compression_target_tokens=int(
            os.environ.get("COMPRESSION_TARGET_TOKENS", "12800")
        ),
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "8000")),
    )


settings = load_settings()
