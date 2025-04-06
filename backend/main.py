import os
import sys

# Add the current directory to the path so that app can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

# This file just re-exports the app from app/main.py
# It fixes import issues when running with uvicorn