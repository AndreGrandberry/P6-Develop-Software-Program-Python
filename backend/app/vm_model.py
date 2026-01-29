from dataclasses import dataclass


@dataclass
class VM:
    """VM dataclass"""

    vm_id: int
    deployedclustername: str
    deployedclusterdescr: str
    clusterdescr: str
    podbox: str
    version: str
    deployedvmstatus: str
    deployedvmtimestamp: str
    deployedclusterowner: str