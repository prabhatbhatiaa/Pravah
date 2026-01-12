from src.config import settings

def calculate_risk(ward_props):
    """Returns a flood risk score (0-100) using drainage, rainfall, and complaints."""
    # Drainage: lower capacity => higher risk (e.g., 30 capacity => 70 risk)
    drainage_val = ward_props.get("drainageCapacity", 50)
    drainage_risk = 100 - drainage_val

    # Rainfall: normalize against 150mm (cap at 100)
    rainfall = ward_props.get("rainfall", settings.DEFAULT_RAINFALL_MM)
    rainfall_risk = min((rainfall / 150) * 100, 100)

    # Complaints: 15 points per complaint (cap at 100)
    complaints = ward_props.get("activeComplaints", 0)
    complaint_risk = min(complaints * 15, 100)

    # Weighted blend (weights come from settings)
    final_score = (
        (drainage_risk * settings.WEIGHT_DRAINAGE)
        + (rainfall_risk * settings.WEIGHT_RAINFALL)
        + (complaint_risk * settings.WEIGHT_COMPLAINTS)
    )

    return round(final_score, 1)


def classify_risk(score):
    """Maps a numeric score to a label for UI/alerts."""
    if score >= settings.RISK_HIGH_THRESHOLD:
        return "High"
    if score >= settings.RISK_MEDIUM_THRESHOLD:
        return "Medium"
    return "Low"