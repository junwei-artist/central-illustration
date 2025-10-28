from pydantic_settings import BaseSettings
from typing import Annotated
import json


def parse_cors_origins(v):
    """Parse CORS origins from various formats."""
    if isinstance(v, list):
        return v if v else ["*"]  # Empty list means allow all
    if isinstance(v, str):
        # Empty string means allow all
        if not v.strip():
            return ["*"]
        # Try to parse as JSON first
        try:
            result = json.loads(v)
            return result if result else ["*"]
        except (json.JSONDecodeError, ValueError):
            # If not JSON, treat as comma-separated string
            origins = [origin.strip() for origin in v.split(',') if origin.strip()]
            return origins if origins else ["*"]
    return v if v else ["*"]


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@db:5432/demodb"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a list."""
        return parse_cors_origins(self.CORS_ORIGINS)
    
    class Config:
        env_file = ".env"


settings = Settings()

