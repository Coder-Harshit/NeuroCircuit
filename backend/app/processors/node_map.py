import importlib
import os
from pathlib import Path
import pkgutil
import sys
from typing import Callable, Dict, Set

NODE_PROCESSING_FUNCTIONS: Dict[str, Callable] = {}
NODE_INSPECTION_FUNCTIONS: Dict[str, Callable] = {}
NODE_INDEGREE: Dict[str, int] = {}
FAILED_NODE_TYPES: Set[str] = set()


def discover_plugins():
    """
    Scans the 'plugins' directory, imports modules, and populates the
    global dictionaries mapping node types to their functions and metadata.
    Clears existing dictionaries before scanning.
    """
    global NODE_PROCESSING_FUNCTIONS, NODE_INSPECTION_FUNCTIONS, NODE_INDEGREE, FAILED_NODE_TYPES

    # Clear previous state
    NODE_PROCESSING_FUNCTIONS.clear()
    NODE_INSPECTION_FUNCTIONS.clear()
    NODE_INDEGREE.clear()
    FAILED_NODE_TYPES.clear()

    print("--- Starting Plugin Discovery ---")

    backend_dir = Path(__file__).parent.parent.parent
    plugins_dir = backend_dir / "plugins"

    plugins_dir.mkdir(exist_ok=True)

    if not plugins_dir.is_dir():
        print(f"ERROR: Plugins directory not found at {plugins_dir}")
        return

    original_sys_path = sys.path[:]
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
        added_to_path = True
    else:
        added_to_path = False

    try:

        for finder, module_name, ispkg in pkgutil.iter_modules([str(plugins_dir)]):
            module_name = f"plugins.{module_name}"

            try:
                if module_name in sys.modules:
                    module = importlib.reload(sys.modules[module_name])
                    print(f"Reloading plugin module: {module_name}")
                else:
                    module = importlib.import_module(module_name)
                    print(f"Loading plugin module: {module_name}")

                if hasattr(module, "node_info"):
                    node_type = module.node_info.get("nodeType")
                    if not node_type:
                        print(
                            f"Warning: Plugin '{module_name}' is missing 'nodeType' in node_info. Skipping."
                        )
                        continue

                    if "function" in module.node_info:
                        func_name = module.node_info["function"]
                        if hasattr(module, func_name):
                            NODE_PROCESSING_FUNCTIONS[node_type] = getattr(
                                module, func_name
                            )
                        else:
                            print(
                                f"Warning: Processing function '{func_name}' not found in plugin '{module_name}' for node type '{node_type}'."
                            )

                    if "inspection_function" in module.node_info:
                        inspect_func_name = module.node_info["inspection_function"]
                        if hasattr(module, inspect_func_name):
                            NODE_INSPECTION_FUNCTIONS[node_type] = getattr(
                                module, inspect_func_name
                            )
                        else:
                            print(
                                f"Warning: Inspection function '{inspect_func_name}' not found in plugin '{module_name}' for node type '{node_type}'."
                            )

                    if "inDegree" in module.node_info:
                        degree = module.node_info["inDegree"]
                        try:
                            NODE_INDEGREE[node_type] = int(degree)
                        except (ValueError, TypeError):
                            print(
                                f"Warning: Invalid inDegree value '{degree}' for node type '{node_type}' in '{module_name}'. Skipping inDegree registration."
                            )
                    else:
                        print(
                            f"Warning: Plugin module '{module_name}' is missing 'node_info'. Skipping."
                        )

            except ModuleNotFoundError as e:
                print(
                    f"Info: Could not load plugin '{module_name}' due to missing dependency: {e}. It might become available after installation."
                )
                FAILED_NODE_TYPES.add(module_name)

            except Exception as e:
                print(f"ERROR loading plugin '{module_name}': {e}")
                FAILED_NODE_TYPES.add(module_name)
                continue

    finally:
        # Clean up sys.path if modified
        if added_to_path and str(backend_dir) in sys.path:
            sys.path.remove(str(backend_dir))

    print(f"--- Plugin Discovery Finished ---")
    print(
        f"Successfully loaded functions for node types: {list(NODE_PROCESSING_FUNCTIONS.keys())}"
    )
    if FAILED_NODE_TYPES:
        print(
            f"Failed to load plugins (or dependencies missing): {list(FAILED_NODE_TYPES)}"
        )


discover_plugins()
