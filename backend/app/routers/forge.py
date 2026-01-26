from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class AnalysisRequest(BaseModel):
    code: str

@router.get("/health")
async def forge_health_check():
    return {"status": "Forge is online", "mode": "Developer"}

@router.post("/analyze")
async def analyze_code(request: AnalysisRequest):
    return {"status":"Pending Implmentation", "complexity": 0}