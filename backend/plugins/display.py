import pandas as pd
from typing import List
from app.classes import DisplayNodeData


# --- Plugin Metadata ---
node_info = {
    "nodeType": "displayNode",
    "function": "process_display_node",
    "inDegree": "1",
}
# -----------------------


def process_display_node(data: DisplayNodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    """Passes through the input DataFrame without modification."""
    if len(inputs)!=1:
        # HIGHLY UNLIKELY THIS WOUDL BE TRIGGERED AS NODE_INDEGREE WOULD BE TAKING CARE OF THIS CASE
        # Still in escape scenarios
        print("  -> Error: DisplayNode should have only 1 input.")
        return pd.DataFrame()
    
    return inputs[0]