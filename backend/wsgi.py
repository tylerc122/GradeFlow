#!/usr/bin/env python3
import os
import sys

# Set the PYTHONPATH correctly
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)

# Import the FastAPI app 
from app.main import app

# This file serves as the entry point for production
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 