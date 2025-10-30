import pandas as pd
from app.classes import FilterNodeData

node_info = {
    "nodeType": "filterRows",
    "function": "process_filter_rows",
    "inspection_function": "inspect_pass_through",
    "inDegree": "1",
}


def process_filter_rows(
    data: FilterNodeData, inputs: list[pd.DataFrame]
) -> pd.DataFrame:
    if not inputs:
        return pd.DataFrame()

    df = inputs[0].copy()

    # Get parameters from the frontend
    column = getattr(data, "column", None)
    operator = getattr(data, "operator", "==")
    value = getattr(data, "value", None)

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


def inspect_pass_through(data: FilterNodeData, inputs: list[list[str]]) -> list[str]:
    """
    A generic inspection function for nodes that don't change the schema.
    It simply passes the schema from its first parent through.
    """
    if inputs:
        return inputs[0]  # Pass the column list from the first parent
    return []
