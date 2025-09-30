import pandas as pd
from typing import List
from app.classes import NodeData


# --- Plugin Metadata ---
node_info = {
    "nodeType": "transformNode",
    "function": "process_transform_node",
    "inDegree": "1",
}
# -----------------------


def process_transform_node(data: NodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    """Applies a transformation to the input DataFrame."""

    if len(inputs)==0:
        # HIGHLY UNLIKELY THIS WOUDL BE TRIGGERED AS NODE_INDEGREE WOULD BE TAKING CARE OF THIS CASE
        # Still in escape scenarios
        print("  -> Error: TransformNode has no input.")
        return pd.DataFrame()

    df = inputs[0].copy() # Work on a copy to avoid side effects
    method = data.method

    print(f"  -> Transforming data using method: {method}")

    if method == 'normalize':
        # Simple min-max normalization example
        df['value'] = (df['value'] - df['value'].min()) / (df['value'].max() - df['value'].min())
    elif method == 'standardize':
        # Simple standardization example
        df['value'] = (df['value'] - df['value'].mean()) / (df['value'].std())
    # We can add 'pca' and others later

    return df