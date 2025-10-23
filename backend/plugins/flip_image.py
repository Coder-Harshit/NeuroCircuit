import cv2 as cv
from app.classes import FlipImageNodeData


# --- Plugin Metadata ---
node_info = {
    "nodeType": "flipImageNode",
    "function": "flip_image_node",
    "inDegree": "1",
}
# -----------------------

def flip_image_node(data: FlipImageNodeData, inputs: list) -> cv.typing.MatLike:
    """Flips an input image horizontally or vertically."""
    if not inputs or inputs[0] is None:
        raise ValueError("Input image is missing for Flip Image node.")

    image_in = inputs[0]

    if data.horizontal and data.vertical:
        flip_code = -1
    elif data.horizontal:
        flip_code = 1
    elif data.vertical:
        flip_code = 0
    else:
        return image_in
    
    flipped_img = cv.flip(image_in, flip_code)
    return flipped_img