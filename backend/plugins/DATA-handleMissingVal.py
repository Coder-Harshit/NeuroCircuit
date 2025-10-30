import pandas as pd
from typing import List
from app.classes import HandleMissingNodeData
from sklearn.impute import SimpleImputer

# --- Plugin Metadata ---
node_info = {
    "nodeType": "handleMissingVal",
    "function": "process_handle_missing",
    "inspection_function": "inspect_pass_through",
    "inDegree": "1",
}
# -----------------------


def process_handle_missing(
    data: HandleMissingNodeData, inputs: List[pd.DataFrame]
) -> pd.DataFrame:
    if not inputs:
        return pd.DataFrame()

    df = inputs[0].copy()
    strategy = getattr(data, "strategy", "mean")

    print(f"  -> Handling missing values with strategy: {strategy}")

    imputer = SimpleImputer(strategy=strategy)

    # Select only numeric columns to impute
    numeric_cols = df.select_dtypes(include=["number"]).columns
    if not numeric_cols.empty:
        df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

    return df


def inspect_pass_through(
    data: HandleMissingNodeData, inputs: List[List[str]]
) -> List[str]:
    """
    A generic inspection function for nodes that don't change the schema.
    It simply passes the schema from its first parent through.
    """
    if inputs:
        return inputs[0]  # Pass the column list from the first parent
    return []
