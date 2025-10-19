from pathlib import Path
from typing import List
import cv2 as cv
from app.classes import SaveImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "saveImageNode",
    "function": "image_save_node",
    # "inspection_function": "inspect_load_csv",
    "inDegree": "1",
}
# -----------------------


def image_save_node(data: SaveImageNodeData, inputs: List[cv.typing.MatLike]) -> None:
    """Saving the Processed image"""
    print(inputs)
    try:
        if not (data.filePath.endswith((".png",".jpg","jpeg"))):
            raise IOError
        save_path_str = data.filePath
        if not save_path_str:
            raise ValueError("No save file path was specified in the Save Image node.")

        save_path = Path(save_path_str)

        print(f"  -> Attempting to save image to: {save_path}")

        # Ensure the directory exists
        save_path.parent.mkdir(parents=True, exist_ok=True)
        
        img = cv.imwrite(str(data.filePath),inputs[0])
    except IOError:
        print(f"Error: Unable to save File {data.filePath} (I/O Error)")
        print("Make sure correct Extension Name is used")