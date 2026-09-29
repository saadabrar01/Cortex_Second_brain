import asyncio
from database import init_db, close_db

async def main():
    print("Creating database tables...")
    await init_db()
    print("Tables created successfully!")
    await close_db()

if __name__ == "__main__":
    asyncio.run(main())