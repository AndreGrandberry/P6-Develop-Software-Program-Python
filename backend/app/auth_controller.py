import jwt
import hashlib
import os
import json
from datetime import datetime, timedelta


class VMAuth:
    """Authentication class"""

    USERS_FILE = os.path.join(
        os.path.dirname(__file__), "..", "mock_data", "users.json"
    )
    JWT_SECRET = os.getenv("JWT_SECRET")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET environment variable not set")
    JWT_ALGORITHM = "HS256"
    JWT_EXP_DELTA_SECONDS = 3600

    def __init__(self):
        self.users = self._load_users()

    def _load_users(self):
        """Load users from the mock JSON file"""
        if not os.path.exists(self.USERS_FILE):
            return []
        with open(self.USERS_FILE, "r") as f:
            return json.load(f)

    @staticmethod
    def _hash_password(password):
        """Hash the password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()

    def authenticate(self, username, password):
        """Authenticate user and return JWT token"""
        password_hash = self._hash_password(password)
        for user in self.users:
            if user["username"] == username and user["password_hash"] == password_hash:
                return self._generate_jwt(username)
        raise RuntimeError("Invalid credentials")

    def _generate_jwt(self, username):
        """Generate JWT token for the authenticated user"""
        payload = {
            "username": username,
            "exp": datetime.utcnow() + timedelta(seconds=self.JWT_EXP_DELTA_SECONDS),
        }
        return jwt.encode(payload, self.JWT_SECRET, algorithm=self.JWT_ALGORITHM)

    def validate_token(self, token):
        """Validate JWT token and return payload if valid"""
        try:
            payload = jwt.decode(
                token, self.JWT_SECRET, algorithms=[self.JWT_ALGORITHM]
            )
            return True, payload
        except Exception as ex:
            return False, str(ex)
