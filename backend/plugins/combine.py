import pandas as pd
from typing import List
from app.classes import CombineNodeData


# --- Plugin Metadata ---
node_info = {
    "nodeType": "combineNode",
    "function": "process_combine_node",
    "inDegree": "2",
}
# -----------------------


def process_combine_node(data: CombineNodeData, inputs: List[pd.DataFrame]) -> pd.DataFrame:
    """Concatenates two input DataFrames along a specified axis."""
    if len(inputs) != 2:
        print("  -> Error: ConcatenateNode requires exactly two inputs.")
        return pd.DataFrame()

    df1 = inputs[0]
    df2 = inputs[1]

    # Use the axis from the node's data
    selected_axis = "vertical (rows)" if data.axis == 0 else "horizontal (columns)"
    print(f"  -> Concatenating two dataframes along axis {data.axis} ({selected_axis}).")

    try:
        # Pass the axis to the concat function
        concatenated_df = pd.concat([df1, df2], axis=data.axis, ignore_index=True)
    except ValueError as e:
        print(f"  -> Error during concatenation: {e}")
        # Return an empty DataFrame or handle the error as needed
        return pd.DataFrame()


    return concatenated_df