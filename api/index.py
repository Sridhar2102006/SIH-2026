import os
import sys

# Ensure project root is in sys.path so modules like backend and qr_engine import cleanly
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.api_server import app

# Vercel's Python runtime discovers 'app' WSGI application directly
