import pandas as pd
from typing import List
from app.classes import SelectColumnNodeData # We will add this in the next step

node_info = {
    "nodeType": "selectColumnNode",
    "function": "process_select_column",
    "inDegree": 1,
    "outDegree": 1,
}

def process_select_column(data: SelectColumnNodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    """
    Selects specified columns from the input DataFrame based on the user's checkbox selections.
    """
    if not inputs:
        return pd.DataFrame()

    df = inputs[0].copy()
    
    # data.columns is the comma-separated string from the frontend, e.g., "name,age"
    columns_to_select = [col.strip() for col in data.columns.split(',') if col.strip()]

    if not columns_to_select:
        # If no columns are selected, we return an empty DataFrame
        # to signify that the data flow should effectively stop or be empty.
        return pd.DataFrame()

    # Filter the DataFrame to only include the selected columns that actually exist
    existing_columns = [col for col in columns_to_select if col in df.columns]
    
    return df[existing_columns]