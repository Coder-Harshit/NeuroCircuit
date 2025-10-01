import pandas as pd
from typing import List
from app.classes import NodeData
from sklearn.impute import SimpleImputer

# --- Plugin Metadata ---
node_info = {
    "nodeType": "handleMissingNode",
    "function": "process_handle_missing",
    "inDegree": "1",
}
# -----------------------


def process_handle_missing(data: NodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    if not inputs:
        return pd.DataFrame()

    df = inputs[0].copy()
    strategy = getattr(data, 'strategy', 'mean')

    print(f"  -> Handling missing values with strategy: {strategy}")

    imputer = SimpleImputer(strategy=strategy)

    # Select only numeric columns to impute
    numeric_cols = df.select_dtypes(include=['number']).columns
    if not numeric_cols.empty:
        df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

    return df