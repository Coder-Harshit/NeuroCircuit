from typing import Any, Dict
from processors.data.transform import process_transform_node
from processors.data.csv_load import process_input_node

NODE_PROCESSING_FUNCTIONS: Dict[str,Any] = {
    "inputNode": process_input_node,
    "transformNode": process_transform_node
}