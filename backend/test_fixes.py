import httpx
import asyncio

async def test_fixes():
    async with httpx.AsyncClient() as client:
        # Test 1: Create note with excerpt
        print("=== Test 1: Create Note with Excerpt ===")
        note_data = {
            "title": "Test Excerpt Field",
            "content": "This is a test note content with #excerpt #test tags",
            "excerpt": "This is a custom excerpt"
        }
        create = await client.post("http://localhost:8000/api/notes", json=note_data)
        print(f"Status: {create.status_code}")
        print(f"Response: {create.json()}")
        note_id = create.json().get('id')
        
        # Test 2: Get the note back
        print("\n=== Test 2: Get Note (verify excerpt) ===")
        get = await client.get(f"http://localhost:8000/api/notes/{note_id}")
        print(f"Status: {get.status_code}")
        print(f"Response: {get.json()}")
        
        # Test 3: Related notes endpoint
        print("\n=== Test 3: Related Notes Endpoint ===")
        related = await client.get(f"http://localhost:8000/api/notes/{note_id}/related")
        print(f"Status: {related.status_code}")
        print(f"Response: {related.json()}")
        
        # Test 4: Search with suggestions
        print("\n=== Test 4: Search with Suggestions ===")
        search = await client.get("http://localhost:8000/api/search?q=MCP")
        print(f"Status: {search.status_code}")
        print(f"Suggestions: {search.json()['suggestions']}")

if __name__ == "__main__":
    asyncio.run(test_fixes())