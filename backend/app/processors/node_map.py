import importlib.util
from pathlib import Path
from typing import Dict, Any, Tuple

def load_plugins() -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Scans the 'plugins' directory, dynamically imports the modules,
    and registers their processing functions.
    """
    NODE_PROCESSING_FUNCTIONS: Dict[str,Any] = {}
    NODE_INDEGREE: Dict[str,int] = {}
    plugins_dir = Path(__file__).parent.parent.parent / "plugins"

    for file_path in plugins_dir.glob("*.py"):
        if file_path.name == "__init__.py":
            continue

        # Dynamically import the Python module from the file
        spec = importlib.util.spec_from_file_location(file_path.stem, file_path)
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # Look for the 'node_info' metadata and the function
            if hasattr(module, 'node_info') and hasattr(module, module.node_info['function']):
                node_type = module.node_info['nodeType']
                function_name = module.node_info['function']
                indegree = int(module.node_info['inDegree'])
                processing_function = getattr(module, function_name)

                NODE_INDEGREE[node_type] = indegree

                NODE_PROCESSING_FUNCTIONS[node_type] = processing_function
                print(f"-> Successfully loaded plugin: {node_type}")

    return NODE_PROCESSING_FUNCTIONS, NODE_INDEGREE

# Load the plugins when the server starts
NODE_PROCESSING_FUNCTIONS, NODE_INDEGREE = load_plugins()