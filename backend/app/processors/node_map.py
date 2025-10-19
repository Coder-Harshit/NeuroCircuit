import importlib
import pkgutil
from typing import Callable, Dict, Set

NODE_PROCESSING_FUNCTIONS: Dict[str, Callable] = {}
NODE_INSPECTION_FUNCTIONS: Dict[str, Callable] = {}
NODE_INDEGREE: Dict[str, int] = {}

# Add a set to keep track of node types that failed to load
FAILED_NODE_TYPES: Set[str] = set()

for _, module_name, _ in pkgutil.iter_modules(["plugins"]):
    try:
        module = importlib.import_module(f"plugins.{module_name}")
        # The module should have a 'node_info' dictionary
        if hasattr(module, "node_info"):
            node_type = module.node_info["nodeType"]
            if not node_type:
                print(
                    f"Warning: Plugin '{module_name}' is missing 'nodeType' in node_info. Skipping."
                )
                continue

            # Register the processing function
            if "function" in module.node_info:
                func_name = module.node_info["function"]
                if hasattr(module, func_name):
                    NODE_PROCESSING_FUNCTIONS[node_type] = getattr(module, func_name)
                else:
                    print(
                        f"Warning: Processing function '{func_name}' not found in plugin '{module_name}' for node type '{node_type}'."
                    )

            # --- NEW: Register the inspection function ---
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

            # Register the in-degree
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
                f"Warning: Plugin module '{module_name}' is missing the 'node_info' dictionary. Skipping."
            )

    except ModuleNotFoundError as e:
        print(
            f"Warning: Could not load plugin '{module_name}' due to missing dependency: {e}. This node type will be unavailable."
        )
        FAILED_NODE_TYPES.add(module_name)

    except Exception as e:
        print(f"Error loading plugin '{module_name}': {e}")
        continue

print(f"Successfully loaded node types: {list(NODE_PROCESSING_FUNCTIONS.keys())}")
if FAILED_NODE_TYPES:
     print(f"Failed to load node types: {list(FAILED_NODE_TYPES)}")