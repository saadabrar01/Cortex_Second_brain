import httpx
import asyncio

async def test_tag_filtering_and_search():
    async with httpx.AsyncClient() as client:
        # Test 1: Tag filtering
        print("=== Test 1: Tag Filtering ===")
        resp = await client.get("http://localhost:8000/api/notes?tag=react")
        print(f"Status: {resp.status_code}")
        notes = resp.json()
        print(f"Notes with tag 'react': {len(notes)}")
        for note in notes:
            print(f"  - {note['title']} (tags: {note['tags']})")
        
        # Test 2: Search
        print("\n=== Test 2: Search ===")
        resp = await client.get("http://localhost:8000/api/search?q=MCP")
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Results: {len(data['results'])}")
        print(f"Suggestions: {data['suggestions']}")
        for result in data['results']:
            print(f"  - {result['title']} (match: {result['match_type']})")
        
        # Test 3: Search in content
        print("\n=== Test 3: Search in content ===")
        resp = await client.get("http://localhost:8000/api/search?q=deployment")
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Results: {len(data['results'])}")
        for result in data['results']:
            print(f"  - {result['title']} (match: {result['match_type']})")
        
        # Test 4: Combined - notes with tag parameter
        print("\n=== Test 4: Notes endpoint with tag param ===")
        resp = await client.get("http://localhost:8000/api/notes?tag=typescript")
        print(f"Status: {resp.status_code}")
        notes = resp.json()
        print(f"Notes with tag 'typescript': {len(notes)}")
        for note in notes:
            print(f"  - {note['title']} (tags: {note['tags']})")

if __name__ == "__main__":
    asyncio.run(test_tag_filtering_and_search())