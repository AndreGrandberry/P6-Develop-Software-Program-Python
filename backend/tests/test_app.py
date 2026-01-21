import unittest
import requests

from unittest.mock import patch, Mock
from app.vmrd_endpoints import VMRDEndpoints


class TestVMRDEndpoints(unittest.TestCase):
    def test_vmrd_authenticate(self):
        vmrd = VMRDEndpoints()
        with patch.object(vmrd, "session") as mock_session:
            mock_session.post.return_value.status_code = 200
            mock_session.post.return_value.json.return_value = {
                "access_token": "mytoken"
            }

            token = vmrd.authenticate(username="bob", password="foo")

            mock_session.post.assert_called_once_with(
                url="https://vmrapiddeploy.lancope.ciscolabs.com/api/auth",
                json={"username": "bob", "password": "foo"},
                timeout=30,
            )
            assert token == "mytoken"

    def test_vmrd_authenticate_fail(self):
        vmrd = VMRDEndpoints()
        with patch.object(vmrd, "session") as mock_session:
            mock_session.post.return_value.status_code = 401
            mock_session.post.return_value.raise_for_status.side_effect = (
                requests.HTTPError("401 Unauthorized")
            )
            with self.assertRaises(requests.HTTPError):
                vmrd.authenticate(username="bob", password="foo")

    @patch("app.vmrd_endpoints.requests.Session")
    def test_vm_cluster_delete_success(self, mock_session):
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"message": "Deleting VMs"}
        mock_session.return_value.get.return_value = mock_response

        vmrd_endpoints = VMRDEndpoints(auth=Mock())

        response = vmrd_endpoints.vm_cluster_delete(cluster=123)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/lc-cluster/delete/123",
            auth=vmrd_endpoints.auth,
            timeout=30,
        )
        self.assertEqual(response, {"message": "Deleting VMs"})

    @patch("app.vmrd_endpoints.requests.Session")
    def test_vm_cluster_delete_fail(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = Exception("Unauthorized")
        mock_session.return_value.get.return_value = mock_response

        vmrd_endpoints = VMRDEndpoints(auth=Mock())

        with self.assertRaises(Exception) as context:
            vmrd_endpoints.vm_cluster_delete(cluster=123)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/lc-cluster/delete/123",
            auth=vmrd_endpoints.auth,
            timeout=30,
        )
        self.assertEqual(str(context.exception), "Unauthorized")

    @patch("app.vmrd_endpoints.requests.Session")
    def test_cluster_detail(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"id": 42, "name": "Test Cluster"}
        mock_session.return_value.get.return_value = mock_response

        vmrd = VMRDEndpoints(auth=Mock())

        result = vmrd.cluster_detail(cluster=42)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/cluster/detail/42",
            auth=vmrd.auth,
            timeout=30,
        )
        self.assertEqual(result, {"id": 42, "name": "Test Cluster"})

    @patch("app.vmrd_endpoints.requests.Session")
    def test_cluster_detail_fail(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_session.return_value.get.return_value = mock_response

        vmrd = VMRDEndpoints(auth=Mock())

        with self.assertRaises(requests.HTTPError) as context:
            vmrd.cluster_detail(cluster=999)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/cluster/detail/999",
            auth=vmrd.auth,
            timeout=30,
        )
        self.assertIn("404 Not Found", str(context.exception))

    @patch("app.vmrd_endpoints.requests.Session")
    def test_lc_cluster_detail_success(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"id": 7, "name": "LC Cluster"}
        mock_session.return_value.get.return_value = mock_response

        vmrd = VMRDEndpoints(auth=Mock())
        result = vmrd.lc_cluster_detail(cluster=7)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/lc-cluster/detail/7",
            auth=vmrd.auth,
            timeout=30,
        )
        self.assertEqual(result, {"id": 7, "name": "LC Cluster"})

    @patch("app.vmrd_endpoints.requests.Session")
    def test_lc_cluster_detail_fail(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_session.return_value.get.return_value = mock_response

        vmrd = VMRDEndpoints(auth=Mock())
        with self.assertRaises(requests.HTTPError) as context:
            vmrd.lc_cluster_detail(cluster=999)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/lc-cluster/detail/999",
            auth=vmrd.auth,
            timeout=30,
        )
        self.assertIn("404 Not Found", str(context.exception))

    @patch("app.vmrd_endpoints.requests.Session")
    def test_vm_versions_success(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"versions": ["1.0", "2.0"]}
        mock_session.return_value.get.return_value = mock_response

        vmrd = VMRDEndpoints(auth=Mock())
        result = vmrd.vm_versions(cluster=5)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/service/getvminclusterclassip/5",
            auth=vmrd.auth,
            timeout=30,
        )
        self.assertEqual(result, {"versions": ["1.0", "2.0"]})

    @patch("app.vmrd_endpoints.requests.Session")
    def test_vm_versions_fail(self, mock_session):
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError(
            "500 Server Error"
        )
        mock_session.return_value.get.return_value = mock_response

        vmrd = VMRDEndpoints(auth=Mock())
        with self.assertRaises(requests.HTTPError) as context:
            vmrd.vm_versions(cluster=999)

        mock_session.return_value.get.assert_called_once_with(
            "https://vmrapiddeploy.lancope.ciscolabs.com/api/service/getvminclusterclassip/999",
            auth=vmrd.auth,
            timeout=30,
        )
        self.assertIn("500 Server Error", str(context.exception))


if __name__ == "__main__":
    unittest.main()
