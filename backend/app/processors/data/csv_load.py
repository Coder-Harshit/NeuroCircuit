from typing import Any, List
import pandas as pd

from app.classes import NodeData

def process_input_node(data: NodeData, inputs: List[Any]) -> pd.DataFrame:
    """Loads data from a CSV file specified in the node's data."""
    print(f"  -> Loading data from: {data.filePath}")
    
    if len(inputs)!=0:
        # HIGHLY UNLIKELY THIS WOUDL BE TRIGGERED AS NODE_INDEGREE WOULD BE TAKING CARE OF THIS CASE
        # Still in escape scenarios
        print("  -> Error: InputNode should not have any input.")
        return pd.DataFrame()

    try:
        # We assume the file is in the 'backend' directory for now
        if (data.filePath==''):
            raise FileNotFoundError
        else:
            df = pd.read_csv(data.filePath)
        return df
    except FileNotFoundError:
        print(f"Error: File not found at {data.filePath}")
        return pd.DataFrame() # Return empty DataFrame on error
