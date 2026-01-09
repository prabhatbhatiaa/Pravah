from pydantic import BaseModel
from typing import List, Optional, Any

# --- Request Models (Input from Frontend) ---

class ComplaintCreate(BaseModel):
    """
    Schema for a new citizen complaint.
    Matches the JSON payload sent by complaints.js.
    """
    ward_id: str
    severity: str  # "Low", "Medium", "High"
    description: Optional[str] = None
    timestamp: Optional[str] = None

class DrainageUpdate(BaseModel):
    """
    Schema for an admin update.
    Matches the payload sent by admin.js.
    """
    ward_id: str
    drainage_capacity: int
    is_cleaned: bool

# --- Response Models (Output to Frontend) ---

class RiskSummary(BaseModel):
    """
    Schema for the top-level dashboard stats.
    """
    totalWards: int
    highRiskCount: int
    mediumRiskCount: int

class PredictionResponse(BaseModel):
    """
    Schema for the AI prediction endpoint.
    """
    hours: int
    predictedFloods: int

# Note: The main map data uses standard GeoJSON. 
# We return that as a raw dictionary for performance, 
# so no specific Pydantic model is needed for the heavy map response.