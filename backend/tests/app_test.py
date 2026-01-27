import unittest
from unittest.mock import patch
from app.app import app


class AppRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    @patch("app.app.VMAuth")
    def test_login_success(self, mock_auth):
        mock_auth.return_value.authenticate.return_value = "fake_token"
        response = self.client.post(
            "/login", json={"username": "user", "password": "pass"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.get_json())

    @patch("app.app.VMAuth")
    def test_login_fail(self, mock_auth):
        mock_auth.return_value.authenticate.side_effect = RuntimeError
        response = self.client.post(
            "/login", json={"username": "user", "password": "wrong"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("login_status", response.get_json())

    @patch("app.app.get_username_from_token", return_value="user")
    @patch("app.app.User")
    def test_whoami_success(self, mock_user, mock_token):
        mock_user.load_user.return_value.whoami.return_value = "user"
        response = self.client.get("/whoami", headers={"Authorization": "Bearer fake"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("username", response.get_json())

    @patch("app.app.get_username_from_token", return_value=None)
    def test_whoami_unauthenticated(self, mock_token):
        response = self.client.get("/whoami")
        self.assertEqual(response.status_code, 401)

    @patch("app.app.VMAuth")
    def test_validate_token_valid(self, mock_auth):
        mock_auth.return_value.validate_token.return_value = (
            True,
            {"username": "user"},
        )
        response = self.client.post("/validate", json={"token": "valid"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["token_validated"])

    @patch("app.app.VMAuth")
    def test_validate_token_invalid(self, mock_auth):
        mock_auth.return_value.validate_token.return_value = (False, "error")
        response = self.client.post("/validate", json={"token": "invalid"})
        self.assertEqual(response.status_code, 401)
        self.assertFalse(response.get_json()["token_validated"])

    @patch("app.app.get_username_from_token", return_value="user")
    @patch("app.app.User")
    def test_list_of_vms_success(self, mock_user, mock_token):
        mock_user.load_user.return_value.vms_user.return_value = {"vms": []}
        response = self.client.get(
            "/vms_by_user", headers={"Authorization": "Bearer fake"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("vms", response.get_json())

    @patch("app.app.User")
    def test_get_vm_found(self, mock_user):
        mock_user.get_vm.return_value = {"id": 1}
        response = self.client.get("/vms/1")
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", response.get_json())

    @patch("app.app.User")
    def test_get_vm_not_found(self, mock_user):
        mock_user.get_vm.return_value = None
        response = self.client.get("/vms/999")
        self.assertEqual(response.status_code, 404)

    @patch("app.app.User")
    def test_vm_list(self, mock_user):
        mock_user.get_all_vms.return_value = {"all_vms": []}
        response = self.client.get("/vms/all")
        self.assertEqual(response.status_code, 200)
        self.assertIn("all_vms", response.get_json())

    @patch("app.app.get_username_from_token", return_value="user")
    @patch("app.app.User")
    def test_vm_cluster_delete_success(self, mock_user, mock_token):
        mock_user.delete_vm.return_value = True
        response = self.client.get(
            "/vms/delete/1", headers={"Authorization": "Bearer fake"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["success"])

    @patch("app.app.get_username_from_token", return_value="user")
    @patch("app.app.User")
    def test_vm_cluster_delete_fail(self, mock_user, mock_token):
        mock_user.delete_vm.return_value = False
        response = self.client.get(
            "/vms/delete/1", headers={"Authorization": "Bearer fake"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    @patch("app.app.get_username_from_token", return_value=None)
    def test_vm_cluster_delete_unauthenticated(self, mock_token):
        response = self.client.get("/vms/delete/1")
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
