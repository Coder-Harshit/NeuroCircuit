import importlib
import pkgutil
from typing import Callable, Dict

NODE_PROCESSING_FUNCTIONS: Dict[str,Callable] = {}
NODE_INSPECTION_FUNCTIONS: Dict[str, Callable] = {}
NODE_INDEGREE: Dict[str,int] = {}
for (_, module_name, _) in pkgutil.iter_modules(['plugins']):
    module = importlib.import_module(f'plugins.{module_name}')
    # The module should have a 'node_info' dictionary
    if hasattr(module, 'node_info'):
        node_type = module.node_info['nodeType']
        
        # Register the processing function
        if 'function' in module.node_info:
            func_name = module.node_info['function']
            if hasattr(module, func_name):
                NODE_PROCESSING_FUNCTIONS[node_type] = getattr(module, func_name)

        # --- NEW: Register the inspection function ---
        if 'inspection_function' in module.node_info:
            inspect_func_name = module.node_info['inspection_function']
            if hasattr(module, inspect_func_name):
                NODE_INSPECTION_FUNCTIONS[node_type] = getattr(module, inspect_func_name)

        # Register the in-degree
        if 'inDegree' in module.node_info:
            NODE_INDEGREE[node_type] = int(module.node_info['inDegree'])
