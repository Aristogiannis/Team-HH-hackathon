import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (one level up from skillvision/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


@dataclass(frozen=True)
class Settings:
    openai_api_key: str
    openai_model: str
    voice: str
    host: str
    port: int


def load_settings() -> Settings:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY environment variable is required. "
            "Copy .env.template to .env and fill in your key."
        )
    return Settings(
        openai_api_key=api_key,
        openai_model=os.environ.get("OPENAI_MODEL", "gpt-realtime"),
        voice=os.environ.get("VOICE", "coral"),
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "8000")),
    )


settings = load_settings()
