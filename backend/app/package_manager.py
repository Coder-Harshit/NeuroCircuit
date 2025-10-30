import json
from pathlib import Path
from typing import Any

from importlib.metadata import distributions

APP_DIR = Path(__file__).parent
APP_ROOT_DIR = APP_DIR.parent
BACKEND_PLUGINS_DIR = APP_ROOT_DIR / "plugins"
MANIFESTS_DIR = APP_DIR / "manifests"


def generate_manifest_mapping() -> dict[str, str]:
    """
    Scans the manifests directory and builds a map of
    { nodeType: category }
    """
    manifestMap = {}
    if not MANIFESTS_DIR.exists:
        print(f"Warning: Manifests directory not found at {MANIFESTS_DIR}")
        return {}
    for manifest_file in MANIFESTS_DIR.glob("*.json"):
        try:
            with open(manifest_file, "r") as manifest:
                manifest_data = json.load(manifest)
            nodeType = manifest_data.get("nodeType")
            category = manifest_data.get("category")
            if nodeType and category:
                manifestMap[nodeType] = category
            else:
                print(
                    f"Warning: Skipping manifest {manifest_file.name}, missing 'nodeType' or 'category'."
                )
        except json.JSONDecodeError:
            print(f"Warning: Could not parse JSON from {manifest_file.name}.")
        except Exception as e:
            print(f"Warning: Error processing manifest {manifest_file.name}: {e}")
    return manifestMap


MANIFEST_MAP = generate_manifest_mapping()


def get_installed_packages() -> set[str]:
    """
    Returns a set of all installed package names using the modern
    importlib.metadata library.
    """
    return {dist.metadata["name"] for dist in distributions()}


def get_node_status() -> list[dict[str, Any]]:
    """
    Reads all node manifests, checks their dependencies against the
    current environment, and returns a list of their statuses.
    """
    installed_packages = get_installed_packages()
    node_statuses: list[dict[str, Any]] = []

    for manifest_path in MANIFESTS_DIR.glob("*.json"):
        try:
            with open(manifest_path, "r") as manifest:
                manifest_data = json.load(manifest)
            node_type = manifest_data.get("nodeType")

            if node_type == "note":
                continue
            if not node_type:
                print(
                    f"Warning: Skipping manifest {manifest_path.name}, missing 'nodeType'."
                )
                continue

            all_deps = manifest_data.get("dependencies", [])

            missing_deps = [dep for dep in all_deps if dep not in installed_packages]

            py_filename = (
                MANIFEST_MAP.get(node_type, "GENERAL") + "_" + node_type + ".py"
            )
            plugin_path = BACKEND_PLUGINS_DIR / py_filename

            status = ""
            if missing_deps:
                status = "Missing Dependencies"
            elif not plugin_path.is_file():
                status = "Available"
            else:
                status = "Installed"

            node_statuses.append(
                {
                    "nodeType": node_type,
                    "label": manifest_data.get("label", node_type),
                    "description": manifest_data.get("description", ""),
                    "status": status,
                    "dependencies": all_deps,
                    "missingDependencies": missing_deps,
                    "defaultData": manifest_data.get("defaultData", {}),
                    "category": manifest_data.get("category", "General"),
                }
            )
        except Exception as e:
            print(f"Error processing manifest {manifest_path.name}: {e}")

    print(f"Found {len(node_statuses)} nodes.")
    return node_statuses
