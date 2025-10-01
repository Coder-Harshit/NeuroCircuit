import pandas as pd
from typing import List
from app.classes import FilterNodeData

node_info = {
    "nodeType": "filterRowsNode",
    "function": "process_filter_rows",
    "inDegree": "1",
}

def process_filter_rows(data: FilterNodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    if not inputs:
        return pd.DataFrame()

    df = inputs[0].copy()

    # Get parameters from the frontend
    column = getattr(data, 'column', None)
    operator = getattr(data, 'operator', '==')
    value = getattr(data, 'value', None)

    if not column or value is None:
        print("  -> Error: Filter parameters (column, value) not set.")
        return df 
    
    print(f"  -> Filtering rows: {column} {operator} {value}")

    try:
        if pd.api.types.is_numeric_dtype(df[column]):
            numeric_value = pd.to_numeric(value)
            query_str = f"`{column}` {operator} {numeric_value}"
        else:
            query_str = f"`{column}` {operator} '{value}'"

        return df.query(query_str)
    except Exception as e:
        print(f"  -> Error during filtering: {e}")
        return df