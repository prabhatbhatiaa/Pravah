from fastapi import APIRouter, HTTPException
from src.models import (
    ComplaintCreate,
    DrainageUpdate,
    RiskSummary,
    PredictionResponse
)
from src.services import data_loader, admin_ops
router = APIRouter()

# Public APIs
@router.get("/wards")
def get_wards():
    return {
        "type": "FeatureCollection",
        "features": data_loader.DB_WARDS
    }

@router.get("/risk-summary", response_model=RiskSummary)
def get_risk_summary():
    wards = data_loader.DB_WARDS
    props = [w["properties"] for w in wards]

    return {
        "totalWards": len(wards),
        "highRiskCount": sum(p.get("riskLevel") == "High" for p in props),
        "mediumRiskCount": sum(p.get("riskLevel") == "Medium" for p in props)
    }

@router.get("/prediction", response_model=PredictionResponse)
def get_prediction(hours: int = 24):
    wards = data_loader.DB_WARDS
    predicted = sum(
        w["properties"]["riskScore"] > 60 for w in wards
    )
    return {
        "hours": hours,
        "predictedFloods": predicted
    }

@router.post("/complaint")
def submit_complaint(complaint: ComplaintCreate):
    data_loader.save_complaint_to_csv(complaint)
    return {
        "status": "success",
        "message": "Complaint registered"
    }

# Admin APIs
@router.get("/admin/overview")
def get_admin_overview():
    return admin_ops.get_admin_overview()

@router.post("/admin/update-drainage")
def update_drainage(update: DrainageUpdate):
    updated = admin_ops.update_drainage_capacity(
        update.ward_id,
        update.drainage_capacity,
        update.is_cleaned
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Ward not found")
    return {
        "status": "success",
        "message": "Drainage updated"
    }