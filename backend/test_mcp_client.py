"""
Test script for MCP server - simulates a client interaction
"""
import asyncio
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp.client.session import ClientSession
from mcp import stdio_client, StdioServerParameters


async def test_mcp():
    # Create server parameters
    server_params = StdioServerParameters(
        command="python",
        args=["-m", "mcp_server"],
        cwd="E:\\AI\\MCP\\cortex-second-brain-dashboard-nextjs\\backend"
    )
    
    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            # Initialize
            await session.initialize()
            
            # List tools
            tools = await session.list_tools()
            print("Available tools:")
            for tool in tools.tools:
                print(f"  - {tool.name}: {tool.description}")
            
            # Test get_notes
            print("\n=== Testing get_notes ===")
            result = await session.call_tool("get_notes", {"skip": 0, "limit": 3})
            print(result.content[0].text)
            
            # Test search_notes
            print("\n=== Testing search_notes ===")
            result = await session.call_tool("search_notes", {"query": "MCP"})
            print(result.content[0].text)
            
            # Test get_notes_by_tag
            print("\n=== Testing get_notes_by_tag ===")
            result = await session.call_tool("get_notes_by_tag", {"tag_name": "react"})
            print(result.content[0].text)
            
            # Test get_all_tags
            print("\n=== Testing get_all_tags ===")
            result = await session.call_tool("get_all_tags", {})
            print(result.content[0].text)


if __name__ == "__main__":
    asyncio.run(test_mcp())