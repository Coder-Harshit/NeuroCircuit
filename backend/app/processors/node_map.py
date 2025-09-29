from typing import Any, Dict
from processors.data.csv_load import process_input_node
from processors.data.transform import process_transform_node
from processors.debuggers.display import process_display_node

NODE_PROCESSING_FUNCTIONS: Dict[str,Any] = {
    "inputNode": process_input_node,
    "transformNode": process_transform_node,
    "displayNode": process_display_node,
}