import asyncio
import httpx

async def test():
    async with httpx.AsyncClient() as client:
        resp = await client.get('http://localhost:8000/api/search?q=MCP')
        data = resp.json()
        print(f'Search results: {len(data["results"])}')
        print(f'Suggestions: {data["suggestions"]}')

asyncio.run(test())