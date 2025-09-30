import json
from pathlib import Path
from typing import List, Dict, Any, Set

from importlib.metadata import distributions


# Path to the manifests dir
MANIFESTS_DIR = Path(__file__).parent / "manifests"

def get_installed_packages() -> Set[str]:
    """
    Returns a set of all installed package names using the modern
    importlib.metadata library.
    """
    return {dist.metadata["name"] for dist in distributions()}

def get_node_status() -> List[Dict[str, Any]]:
    """
    Reads all node manifests, checks their dependencies against the
    current environment, and returns a list of their statuses.
    """
    installed_packages = get_installed_packages()
    node_statuses: List[Dict[str,Any]] = []

    for manifest_path in MANIFESTS_DIR.glob("*.json"):
        with open(manifest_path, "r") as f:
            # Opening each manifest file
            manifest = json.load(f)
            # Check if all dependencies for this node are installed
            missing_deps = [
                dep for dep in manifest["dependencies"]
                if dep not in installed_packages
            ]

            status = "Installed" if not missing_deps else "Missing Dependencies"

            node_statuses.append({
                "nodeType": manifest["nodeType"],
                "label": manifest.get("label", manifest["nodeType"]),
                "description": manifest.get("description", ""),
                "status": status,
                "missingDependencies": missing_deps,
                "defaultData": manifest.get("defaultData", {})
            })
    

    return node_statuses