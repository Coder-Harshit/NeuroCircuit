import cv2 as cv
from app.classes import LoadImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "loadImage",
    "function": "image_input_node",
    # "inspection_function": "inspect_load_csv",
    "inDegree": "0",
}
# -----------------------


def image_input_node(data: LoadImageNodeData, *args):
    """Loads an image from a file specified in the node's data."""
    if not data.filePath:
        # Raise an error if the path is empty
        raise ValueError("File path is missing in the Image Input node.")

    print(f"  -> Loading image from: {data.filePath}")

    try:
        if data.filePath == "":
            raise FileNotFoundError
        else:
            img = cv.imread(data.filePath)
        if img is None:
            raise IOError(
                f"Failed to load image. Check that the file exists and is a valid image: {data.filePath}"
            )
        return img
    except FileNotFoundError:
        print(f"Error: File not found at {data.filePath}")
        return None
