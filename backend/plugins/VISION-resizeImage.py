import cv2 as cv
from typing import Any
from app.classes import ResizeImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "resizeImage",
    "function": "image_resize_node",
    # "inspection_function": "inspect_load_csv",
    "inDegree": "1",
}
# -----------------------


def image_resize_node(
    data: ResizeImageNodeData, inputs: list[Any]
) -> cv.typing.MatLike:
    """Resizes an input image to the specified width and height."""
    if not inputs or inputs[0] is None:
        raise ValueError("Input image is missing for Resize Image node.")

    image_in = inputs[0]

    if not isinstance(data.width, int) or data.width <= 0:
        raise ValueError(
            f"Invalid width specified: {data.width}. Must be a positive integer."
        )

    if not isinstance(data.height, int) or data.height <= 0:
        raise ValueError(
            f"Invalid height specified: {data.height}. Must be a positive integer."
        )

    print(f"Resizing from {image_in.shape[:2]} -> ({data.height}, {data.width})")

    rz_img = cv.resize(image_in, (data.width, data.height))

    return rz_img
