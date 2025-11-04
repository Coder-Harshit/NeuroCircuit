import cv2 as cv
from typing import Any
from app.classes import CannyEdgeNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "cannyEdge",
    "function": "canny_edge_node",
    "inDegree": "1",
}
# -----------------------


def canny_edge_node(data: CannyEdgeNodeData, inputs: list[Any]) -> cv.typing.MatLike:
    """Performs Canny edge detection on an input image."""
    if not inputs or inputs[0] is None:
        raise ValueError("Input image is missing.")

    image_in: cv.typing.MatLike = inputs[0]

    if len(image_in.shape) == 3 and image_in.shape[2] == 3:
        print("  -> Converting input image to grayscale for Canny.")
        image_in = cv.cvtColor(image_in, cv.COLOR_BGR2GRAY)
    elif len(image_in.shape) == 3 and image_in.shape[2] == 4:
        print("  -> Converting input image to grayscale for Canny.")
        image_in = cv.cvtColor(image_in, cv.COLOR_BGRA2GRAY)

    t1 = data.threshold1
    t2 = data.threshold2

    print(f"  -> Applying Canny edge detection with thresholds: {t1}, {t2}")

    return cv.Canny(image_in, t1, t2)
