"""
Development server runner for the product catalog API.

Run this script to start the development server:
    python run_api.py
"""

import uvicorn

from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.api_port, reload=True, log_level="info")
