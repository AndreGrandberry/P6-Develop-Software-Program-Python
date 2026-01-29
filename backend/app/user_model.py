import os
import json
from dataclasses import dataclass, field
from typing import List, Optional
from vm_model import VM


@dataclass
class User:
    """User dataclass"""

    authtype: str
    email: str
    fullname: str
    id: int
    spusername: Optional[str]
    status: str
    username: str
    userpass: Optional[str]
    vms: List[VM] = field(default_factory=list)

    @staticmethod
    def load_user(user_id: str) -> Optional["User"]:
        """Load user data from mock JSON file

        Takes in a user_id (username) string

        Returns: User object if user exists, else return None

        Complexity: O(n) where n is the number of users in the JSON file

        """
        users_file = os.path.join(
            os.path.dirname(__file__), "..", "mock_data", "users_data.json"
        )
        if not os.path.exists(users_file):
            return None
        with open(users_file, "r") as f:
            users_data = json.load(f)
        for user_dict in users_data:
            if user_dict["username"] == user_id:
                user_dict["vms"] = [VM(**vm) for vm in user_dict.get("vms", [])]
                return User(**user_dict)
        return None

    @staticmethod
    def get_all_vms() -> list:
        """Get all VMs from all users in the mock JSON file

        Returns: list of all VM dictionaries

        Complexity: O(n) where n is the total number of VMs across all users.
        """
        users_file = os.path.join(
            os.path.dirname(__file__), "..", "mock_data", "users_data.json"
        )
        if not os.path.exists(users_file):
            return []
        with open(users_file, "r") as f:
            users_data = json.load(f)
        all_vms = []
        for user in users_data:
            all_vms.extend(user.get("vms", []))
        return all_vms

    def whoami(self):
        """Returns the username of the user

        Complexity: O(1) Retrieving an attribute takes a fixed amount of time"""
        return self.username

    def vms_user(self):
        """Returns the list of VM objects associated with the user

        Complexity: O(1) Retrieving an attribute takes a fixed amount of time"""
        return self.vms

    @staticmethod
    def get_vm(vm_id: int) -> Optional[VM]:
        """Get a VM by vm_id from all users in the mock JSON file

        Takes in a vm_id integer and returns the VM dictionary if found

        Complexity: O(n) where n is the total number of VMs across all users."""
        all_vms = User.get_all_vms()
        for vm in all_vms:
            if vm["vm_id"] == vm_id:
                return vm
        return None

    @staticmethod
    def delete_vm(username: str, vm_id: int) -> bool:
        """Deletes a VM by vm_id for a specific user and from vms_all.json

        Takes in a username string and vm_id integer

        Returns: True if VM was deleted, else False

        Complexity: O(n) where n is the number of users in the JSON file"""
        users_file = os.path.join(
            os.path.dirname(__file__), "..", "mock_data", "users_data.json"
        )
        vms_all_file = os.path.join(
            os.path.dirname(__file__), "..", "mock_data", "vms_all.json"
        )
        if not os.path.exists(users_file):
            return False
        with open(users_file, "r") as f:
            users_data = json.load(f)
        deleted = False
        for user in users_data:
            if user["username"] == username:
                vms = user.get("vms", [])
                new_vms = [vm for vm in vms if vm.get("vm_id") != vm_id]
                if len(new_vms) != len(vms):
                    user["vms"] = new_vms
                    deleted = True
                break
        if deleted:
            with open(users_file, "w") as f:
                json.dump(users_data, f, indent=2)
            if os.path.exists(vms_all_file):
                with open(vms_all_file, "r") as f:
                    vms_all = json.load(f)
                vms_all = [vm for vm in vms_all if vm.get("vm_id") != vm_id]
                with open(vms_all_file, "w") as f:
                    json.dump(vms_all, f, indent=2)
        return deleted
