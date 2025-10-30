import base64
import numpy as np
import cv2 as cv
from app.classes import DisplayImageNodeData

# --- Plugin Metadata ---
node_info = {
    "nodeType": "displayImage",
    "function": "display_image_node",
    "inDegree": 1,
}
# -----------------------


def display_image_node(
    data: DisplayImageNodeData, inputs: list[np.ndarray]
) -> str | None:
    """
    Receives an image from parent results and returns a base64 data URL (PNG)
    """
    if not inputs or inputs[0] is None:
        print(f"Display Image node received invalid or no input")
        return None

    in_image = inputs[0]

    try:
        # Image Dimensionality Check
        if in_image.ndim == 2:
            # Grayscale image
            out_img = cv.cvtColor(in_image, cv.COLOR_GRAY2BGR)
        elif in_image.ndim == 3 and in_image.shape[2] == 4:
            # RGBA image
            out_img = cv.cvtColor(in_image, cv.COLOR_BGRA2BGR)
        else:
            out_img = in_image

        # IMAGE ENCODE
        status, buffer = cv.imencode(".png", out_img)
        if not status:
            print("Failed to encode image in Display Image node.")
            return None

        base64_enc_str = base64.b64encode(buffer.tobytes()).decode("ascii")
        d_url = f"data:image/png;base64,{base64_enc_str}"
        # with open("temp.txt",'w') as file:
        #     file.write(d_url)
        return d_url

    except Exception as e:
        print(
            f"Error in display_image_node ({getattr(data, 'label', 'Display Image')}): {e}"
        )
        return None
