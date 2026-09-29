r"""
MCP Server Validation Script
Run with: .venv\Scripts\python.exe validate_mcp.py
"""
import sys
import os

# Ensure the backend directory is in path (same as what PYTHONPATH env var does)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 55)
print("MCP Server Environment Validation")
print("=" * 55)
print(f"Python:     {sys.version.split()[0]}")
print(f"Executable: {sys.executable}")
print(f"CWD:        {os.getcwd()}")
print()

errors = []

# 1. Core MCP imports
try:
    from mcp import types
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    print("[OK] mcp package imports (types, Server, stdio_server)")
except ImportError as e:
    errors.append(f"[FAIL] mcp imports: {e}")
    print(errors[-1])

# 2. SQLAlchemy
try:
    from sqlalchemy import select, func, or_
    from sqlalchemy.ext.asyncio import AsyncSession
    print("[OK] sqlalchemy imports")
except ImportError as e:
    errors.append(f"[FAIL] sqlalchemy: {e}")
    print(errors[-1])

# 3. Project-local modules
try:
    from config import settings
    print(f"[OK] config.settings loaded (DB: {str(settings.database_url)[:40]}...)")
except Exception as e:
    errors.append(f"[FAIL] config: {e}")
    print(errors[-1])

try:
    from database import AsyncSessionLocal, init_db
    print("[OK] database module")
except Exception as e:
    errors.append(f"[FAIL] database: {e}")
    print(errors[-1])

try:
    from models import Note, NoteTag, Tag
    print("[OK] models module (Note, NoteTag, Tag)")
except Exception as e:
    errors.append(f"[FAIL] models: {e}")
    print(errors[-1])

# 4. Test MCP server object creation
try:
    app = Server("second-brain-mcp")
    print("[OK] MCP Server instance created")
except Exception as e:
    errors.append(f"[FAIL] Server init: {e}")
    print(errors[-1])

print()
print("=" * 55)
if errors:
    print(f"RESULT: {len(errors)} ERROR(S) FOUND - fix before using with Claude Desktop")
    sys.exit(1)
else:
    print("RESULT: ALL CHECKS PASSED - Server is ready for Claude Desktop")
print("=" * 55)
