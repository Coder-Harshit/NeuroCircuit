import pandas as pd
from typing import Any, List
from app.classes import InputNodeData


# --- Plugin Metadata ---
node_info = {
    "nodeType": "csvInput",
    "function": "process_input_node",
    "inspection_function": "inspect_load_csv",
    "inDegree": "0",
}
# -----------------------


def process_input_node(data: InputNodeData, inputs: List[Any]) -> pd.DataFrame:
    """Loads data from a CSV file specified in the node's data."""
    print(f"  -> Loading data from: {data.filePath}")

    if len(inputs) != 0:
        # HIGHLY UNLIKELY THIS WOUDL BE TRIGGERED AS NODE_INDEGREE WOULD BE TAKING CARE OF THIS CASE
        # Still in escape scenarios
        print("  -> Error: InputNode should not have any input.")
        return pd.DataFrame()

    try:
        # We assume the file is in the 'backend' directory for now
        if data.filePath == "":
            raise FileNotFoundError
        else:
            df = pd.read_csv(data.filePath)
        return df
    except FileNotFoundError:
        print(f"Error: File not found at {data.filePath}")
        return pd.DataFrame()  # Return empty DataFrame on error


def inspect_load_csv(data: InputNodeData, inputs: List) -> List[str]:
    """
    Inspects an inputNode to get its output schema (column names).
    Efficiently reads only the header of the CSV.
    """
    file_path = data.filePath
    if file_path:
        try:
            df_header = pd.read_csv(file_path, nrows=0)
            return df_header.columns.tolist()
        except Exception:
            return []
    return []
