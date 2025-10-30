from typing import Any
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_exec_graph_success():
    """
    Test & validate, simple graph exec. pipeline
    """
    mock_graph: dict[str, Any] = {
        "nodes": [
            {
                "id": "1",
                "type": "inputNode",
                "position": {"x": 0, "y": 0},
                "data": {"label": "Load", "filePath": "data.csv"},
            },
            {
                "id": "2",
                "type": "transformNode",
                "position": {"x": 0, "y": 0},
                "data": {"label": "Transform", "method": "normalize"},
            },
        ],
        "edges": [{"id": "1-2", "source": "1", "target": "2"}],
    }

    resp = client.post("/execute", json=mock_graph)

    assert resp.status_code == 200

    resp_json = resp.json()
    assert resp_json["status"] == "success"
    assert "exec_order" in resp_json
    assert resp_json["exec_order"] == ["1", "2"]
