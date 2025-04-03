from fastapi.testclient import TestClient
import redis
from sqlalchemy import text
from app.main import app
from app.database.database import engine

client = TestClient(app)

def test_database():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")
    except Exception as e:
        print("❌ Database connection failed:", str(e))

def test_redis():
    """Test Redis connection"""
    try:
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis connection successful")
    except Exception as e:
        print("❌ Redis connection failed:", str(e))

def test_auth_endpoints():
    """Test authentication endpoints"""
    # Test registration
    register_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = client.post("/api/auth/register", json=register_data)
        if response.status_code == 200:
            print("✅ Registration endpoint working")
        elif response.status_code == 400 and "Email already registered" in response.text:
            print("✅ Registration endpoint working (user already exists)")
        else:
            print("❌ Registration failed:", response.text)
            
        # Test login
        login_response = client.post("/api/auth/login", json=register_data)
        if login_response.status_code == 200:
            print("✅ Login endpoint working")
        else:
            print("❌ Login failed:", login_response.text)
            
    except Exception as e:
        print("❌ Auth endpoints test failed:", str(e))

if __name__ == "__main__":
    print("\nTesting system setup...")
    print("-" * 50)
    test_database()
    test_redis()
    test_auth_endpoints()
    print("-" * 50)