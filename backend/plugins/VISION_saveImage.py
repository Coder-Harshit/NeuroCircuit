from pathlib import Path
from typing import List
import cv2 as cv
from app.classes import SaveImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "saveImage",
    "function": "image_save_node",
    # "inspection_function": "inspect_load_csv",
    "inDegree": "1",
}
# -----------------------

TEMP_DIR = Path("temp_uploads")


def image_save_node(data: SaveImageNodeData, inputs: List[cv.typing.MatLike]) -> str:
    """Saving the Processed image"""
    filename = "image.png"
    save_path = TEMP_DIR / filename

    print(f"  -> Attempting to save image to: {save_path}")

    TEMP_DIR.mkdir(exist_ok=True)

    success = cv.imwrite(str(save_path), inputs[0])
    if not success:
        raise IOError(f"OpenCV failed to save temporary image to {save_path}.")

    print("  -> Temporary image saved.")
    return filename
