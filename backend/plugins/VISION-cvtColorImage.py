import cv2 as cv
from app.classes import CvtColorImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "cvtColorImage",
    "function": "cvt_color_image_node",
    "inDegree": "1",
}
# -----------------------


def cvt_color_image_node(
    data: CvtColorImageNodeData, inputs: list
) -> cv.typing.MatLike:
    """Converts an input image from one color space to another."""
    if not inputs or inputs[0] is None:
        raise ValueError("Input image is missing for Color Space Conversion node.")

    image_in = inputs[0]

    conversionFlag = f"COLOR_{data.in_colorspace}2{data.out_colorspace}"

    conversionCode = getattr(cv, conversionFlag, None)

    if conversionCode is None:
        raise ValueError(
            f"Invalid color space conversion: {data.in_colorspace} to {data.out_colorspace}"
        )

    converted_img = cv.cvtColor(image_in, conversionCode)

    return converted_img
