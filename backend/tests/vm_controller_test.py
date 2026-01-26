import unittest
from unittest.mock import patch, mock_open
from app.vm_controllers import User, VM

import json

MOCK_USERS = [
    {
        "authtype": "local",
        "email": "test@example.com",
        "fullname": "Test User",
        "id": 1,
        "spusername": None,
        "status": "active",
        "username": "testuser",
        "userpass": "pass",
        "vms": [
            {
                "vm_id": 101,
                "deployedclustername": "cluster1",
                "deployedclusterdescr": "desc",
                "clusterdescr": "desc",
                "podbox": "box1",
                "version": "1.0",
                "deployedvmstatus": "INSTALLED",
                "deployedvmtimestamp": "2024-01-01T00:00:00Z",
                "deployedclusterowner": "testuser"
            }
        ]
    }
]

MOCK_VMS_ALL = [
    {
        "vm_id": 101,
        "deployedclustername": "cluster1",
        "deployedclusterdescr": "desc",
        "clusterdescr": "desc",
        "podbox": "box1",
        "version": "1.0",
        "deployedvmstatus": "INSTALLED",
        "deployedvmtimestamp": "2024-01-01T00:00:00Z",
        "deployedclusterowner": "testuser"
    }
]

class TestVMControllers(unittest.TestCase):
    @patch("os.path.exists", return_value=True)
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps(MOCK_USERS))
    def test_load_user_success(self, mock_file, mock_exists):
        user = User.load_user("testuser")
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "testuser")
        self.assertEqual(len(user.vms), 1)
        self.assertIsInstance(user.vms[0], VM)

    @patch("os.path.exists", return_value=True)
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps(MOCK_USERS))
    def test_get_all_vms(self, mock_file, mock_exists):
        vms = User.get_all_vms()
        self.assertEqual(len(vms), 1)
        self.assertEqual(vms[0]["vm_id"], 101)

    def test_whoami(self):
        user = User(
            authtype="local",
            email="a@b.com",
            fullname="A B",
            id=2,
            spusername=None,
            status="active",
            username="alice",
            userpass=None,
            vms=[]
        )
        self.assertEqual(user.whoami(), "alice")

    def test_vms_user(self):
        vm = VM(
            vm_id=1,
            deployedclustername="c",
            deployedclusterdescr="d",
            clusterdescr="d",
            podbox="p",
            version="v",
            deployedvmstatus="s",
            deployedvmtimestamp="t",
            deployedclusterowner="o"
        )
        user = User(
            authtype="local",
            email="a@b.com",
            fullname="A B",
            id=2,
            spusername=None,
            status="active",
            username="alice",
            userpass=None,
            vms=[vm]
        )
        self.assertEqual(user.vms_user(), [vm])

    @patch("os.path.exists", return_value=True)
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps(MOCK_USERS))
    def test_get_vm_found(self, mock_file, mock_exists):
        vm = User.get_vm(101)
        self.assertIsNotNone(vm)
        self.assertEqual(vm["vm_id"], 101)

    @patch("os.path.exists", return_value=True)
    @patch("builtins.open", new_callable=mock_open, read_data=json.dumps(MOCK_USERS))
    def test_get_vm_not_found(self, mock_file, mock_exists):
        vm = User.get_vm(999)
        self.assertIsNone(vm)

    @patch("os.path.exists", side_effect=lambda path: "users_data" in path or "vms_all" in path)
    @patch("builtins.open")
    def test_delete_vm(self, mock_open_func, mock_exists):
        # Setup mock for users_data.json and vms_all.json
        users_file = mock_open(read_data=json.dumps(MOCK_USERS))
        vms_all_file = mock_open(read_data=json.dumps(MOCK_VMS_ALL))
        mock_open_func.side_effect = [users_file.return_value, users_file.return_value, vms_all_file.return_value, vms_all_file.return_value]
        result = User.delete_vm("testuser", 101)
        self.assertTrue(result)

    @patch("os.path.exists", return_value=False)
    def test_load_user_file_not_exist(self, mock_exists):
        user = User.load_user("testuser")
        self.assertIsNone(user)

    @patch("os.path.exists", return_value=False)
    def test_get_all_vms_file_not_exist(self, mock_exists):
        vms = User.get_all_vms()
        self.assertEqual(vms, [])

    @patch("os.path.exists", return_value=False)
    def test_delete_vm_file_not_exist(self, mock_exists):
        result = User.delete_vm("testuser", 101)
        self.assertFalse(result)

