import cv2 as cv
from typing import Any
from app.classes import RotateImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "rotateImage",
    "function": "rotate_image_node",
    "inDegree": "1",
}
# -----------------------


def rotate_image_node(
    data: RotateImageNodeData, inputs: list[Any]
) -> cv.typing.MatLike:
    """Rotates an input image at the specified angle."""
    if not inputs or inputs[0] is None:
        raise ValueError("Input image is missing for Rotate Image node.")

    image_in = inputs[0]
    
    (h, w) = image_in.shape[:2]
    (cX, cY) = (w // 2, h // 2)
    
    rotationAngle = data.angle * (-1 if data.rotationDirection == "Anticlockwise" else 1)

    M = cv.getRotationMatrix2D((cX, cY), rotationAngle, 1.0)
    rotated_img = cv.warpAffine(image_in, M, (w, h))

    return rotated_img
