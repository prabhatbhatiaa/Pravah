from fastapi import APIRouter, HTTPException
from src.models import ComplaintCreate, DrainageUpdate, RiskSummary, PredictionResponse
from src.services import data_loader, admin_ops

router = APIRouter()

# --- Public Endpoints ---

@router.get("/wards")
def get_wards():
    """
    Returns the full GeoJSON FeatureCollection of all wards.
    Used by the map to render polygons/points and colors.
    """
    # Return the raw list of features as a FeatureCollection
    return {"type": "FeatureCollection", "features": data_loader.DB_WARDS}

@router.get("/risk-summary", response_model=RiskSummary)
def get_risk_summary():
    """
    Returns high-level stats for the dashboard counters.
    """
    wards = data_loader.DB_WARDS
    # Extract properties list for easier counting
    props = [w['properties'] for w in wards]
    
    high = sum(1 for p in props if p.get('riskLevel') == "High")
    medium = sum(1 for p in props if p.get('riskLevel') == "Medium")
    
    return {
        "totalWards": len(wards),
        "highRiskCount": high,
        "mediumRiskCount": medium
    }

@router.get("/prediction", response_model=PredictionResponse)
def get_prediction(hours: int = 24):
    """
    Mock AI Endpoint: Predicts flooding based on current risk scores.
    Logic: Any ward with Risk Score > 60 is 'Predicted to Flood'.
    """
    wards = data_loader.DB_WARDS
    at_risk = sum(1 for w in wards if w['properties']['riskScore'] > 60)
    return {"hours": hours, "predictedFloods": at_risk}

@router.post("/complaint")
def submit_complaint(complaint: ComplaintCreate):
    """
    Receives a citizen complaint, saves it to CSV, and triggers a risk recalculation.
    """
    # This function saves to CSV AND updates the in-memory state
    data_loader.save_complaint_to_csv(complaint)
    
    print(f"📝 Complaint Logged for Ward {complaint.ward_id}: {complaint.severity}")
    return {"status": "success", "message": "Complaint registered & Risk Score Updated"}

# --- Admin Endpoints ---

@router.get("/admin/overview")
def get_admin_data():
    """
    Returns sorted ward data specifically for the Admin Dashboard table.
    """
    return admin_ops.get_admin_overview()

@router.post("/admin/update-drainage")
def update_drainage(update: DrainageUpdate):
    """
    Updates drainage capacity in the CSV and re-runs the risk engine.
    """
    success = admin_ops.update_drainage_capacity(
        update.ward_id, 
        update.drainage_capacity, 
        update.is_cleaned
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Ward not found")
        
    return {"status": "success", "message": "Drainage updated successfully"}