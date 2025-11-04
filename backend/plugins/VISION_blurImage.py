import cv2 as cv
from typing import Any
from app.classes import BlurImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "blurImage",
    "function": "blur_image_node",
    "inDegree": "1",
}
# -----------------------


def blur_image_node(data: BlurImageNodeData, inputs: list[Any]) -> cv.typing.MatLike:
    """Applies a specified blur to an input image."""
    if not inputs or inputs[0] is None:
        raise ValueError("Input image is missing.")

    image_in = inputs[0]

    ksize = data.kernelSize

    if ksize <= 0:
        ksize = 1
    elif ksize % 2 == 0:
        # kernel size should be odd
        ksize += 1

    if data.blurType == "GAUSSIAN":
        return cv.GaussianBlur(image_in, (ksize, ksize), 0)
    elif data.blurType == "MEDIAN":
        return cv.medianBlur(image_in, ksize)
    elif data.blurType == "BILATERAL":
        return cv.bilateralFilter(image_in, ksize, 75, 75)
    else:
        raise ValueError
