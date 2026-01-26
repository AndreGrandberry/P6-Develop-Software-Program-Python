import unittest
from unittest.mock import patch, mock_open
import os
import json

from app.auth_controller import VMAuth

class TestVMAuth(unittest.TestCase):
    @patch.dict(os.environ, {"JWT_SECRET": "testsecret"})
    @patch("builtins.open", new_callable=mock_open, read_data='[{"username": "user1", "password_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"}]')
    @patch("os.path.exists", return_value=True)
    def setUp(self, mock_exists, mock_file):
        self.auth = VMAuth()

    def test_hash_password(self):
        hashed = self.auth._hash_password("password")
        self.assertEqual(
            hashed,
            "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
        )

    def test_authenticate_success(self):
        token = self.auth.authenticate("user1", "password")
        self.assertIsInstance(token, str)

    def test_authenticate_failure(self):
        with self.assertRaises(RuntimeError):
            self.auth.authenticate("user1", "wrongpassword")

    def test_generate_jwt_and_validate(self):
        token = self.auth._generate_jwt("user1")
        is_valid, payload = self.auth.validate_token(token)
        self.assertTrue(is_valid)
        self.assertEqual(payload["username"], "user1")

    def test_validate_token_invalid(self):
        is_valid, error = self.auth.validate_token("invalid.token.here")
        self.assertFalse(is_valid)
        self.assertIsInstance(error, str)

if __name__ == "__main__":
    unittest.main()
