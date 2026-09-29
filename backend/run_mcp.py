#!/usr/bin/env python
"""
MCP Server startup script for Second Brain Dashboard.

Usage:
    python run_mcp.py           # Run MCP server over stdio
    python run_mcp.py --http    # Run MCP server over HTTP (for testing)
"""

import argparse
import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp_server import app, main as mcp_main


def main():
    parser = argparse.ArgumentParser(description="Second Brain MCP Server")
    parser.add_argument("--http", action="store_true", help="Run over HTTP instead of stdio")
    parser.add_argument("--host", default="127.0.0.1", help="Host for HTTP server")
    parser.add_argument("--port", type=int, default=8001, help="Port for HTTP server")
    args = parser.parse_args()

    if args.http:
        # For HTTP transport, you'd need to set up a different transport
        print(f"MCP HTTP server not yet implemented. Use stdio mode.")
        print(f"Run: python -m mcp_server")
    else:
        print("Starting MCP server over stdio...")
        asyncio.run(mcp_main())


if __name__ == "__main__":
    main()