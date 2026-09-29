import httpx
import asyncio

async def test_api():
    async with httpx.AsyncClient() as client:
        # Test health
        health = await client.get("http://localhost:8000/health")
        print(f"Health: {health.json()}")
        
        # Test create note with tags (hashtags in content)
        note_data = {
            "title": "Test Note with Tags",
            "content": "This is a test note content with #react and #typescript tags",
            "tags": ["test", "demo"]
        }
        create = await client.post("http://localhost:8000/api/notes", json=note_data)
        print(f"Create status: {create.status_code}")
        print(f"Create response: {create.text}")
        if create.status_code == 201:
            print(f"Created note: {create.json()}")
        
        # Test list notes
        notes = await client.get("http://localhost:8000/api/notes")
        print(f"Notes status: {notes.status_code}")
        print(f"Notes response: {notes.text}")
        if notes.status_code == 200:
            print(f"All notes: {notes.json()}")
        
        # Test tags
        tags = await client.get("http://localhost:8000/api/tags")
        print(f"Tags: {tags.json()}")

if __name__ == "__main__":
    asyncio.run(test_api())