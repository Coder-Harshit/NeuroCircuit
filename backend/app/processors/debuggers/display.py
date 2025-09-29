from typing import List
import pandas as pd

from app.classes import NodeData

def process_display_node(data: NodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    """Passes through the input DataFrame without modification."""
    if len(inputs)!=1:
        # HIGHLY UNLIKELY THIS WOUDL BE TRIGGERED AS NODE_INDEGREE WOULD BE TAKING CARE OF THIS CASE
        # Still in escape scenarios
        print("  -> Error: DisplayNode should have only 1 input.")
        return pd.DataFrame()
    
    return inputs[0]