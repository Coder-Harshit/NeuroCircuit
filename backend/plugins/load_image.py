import cv2 as cv
from app.classes import LoadImageNodeData
# --- Plugin Metadata ---
node_info = {
    "nodeType": "loadImageNode",
    "function": "image_input_node",
    # "inspection_function": "inspect_load_csv",
    "inDegree": "0",
}
# -----------------------


def image_input_node(data: LoadImageNodeData, **kwargs):
    """Loads an image from a file specified in the node's data."""
    print(f"  -> Loading image from: {data.filePath}")

    try:
        if (data.filePath==''):
            raise FileNotFoundError
        else:
            img = cv.imread(data.filePath)
        return img
    except FileNotFoundError:
        print(f"Error: File not found at {data.filePath}")
        return None