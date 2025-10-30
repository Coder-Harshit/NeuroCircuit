import pandas as pd
from app.classes import DisplayNodeData


# --- Plugin Metadata ---
node_info = {
    "nodeType": "display",
    "function": "process_display_node",
    "inspection_function": "inspect_pass_through",
    "inDegree": "1",
}
# -----------------------


def process_display_node(
    data: DisplayNodeData, inputs: list[pd.DataFrame]
) -> pd.DataFrame:
    """Passes through the input DataFrame without modification."""
    if len(inputs) != 1:
        # HIGHLY UNLIKELY THIS WOUDL BE TRIGGERED AS NODE_INDEGREE WOULD BE TAKING CARE OF THIS CASE
        # Still in escape scenarios
        print("  -> Error: DisplayNode should have only 1 input.")
        return pd.DataFrame()

    return inputs[0]


def inspect_pass_through(data: DisplayNodeData, inputs: list[list[str]]) -> list[str]:
    """
    A generic inspection function for nodes that don't change the schema.
    It simply passes the schema from its first parent through.
    """
    if inputs:
        return inputs[0]  # Pass the column list from the first parent
    return []
