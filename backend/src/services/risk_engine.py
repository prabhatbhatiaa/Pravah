from src.config import settings

def calculate_risk(ward_props):
    """
    Core algorithm to determine flood risk score (0-100).
    Logic:
    1. Bad Drainage is the biggest risk factor (Weight: 50%).
    2. High Rainfall acts as a multiplier (Weight: 30%).
    3. Active Complaints validate the risk (Weight: 20%).
    """
    
    # 1. Drainage Factor (Inverse: Lower capacity = Higher risk)
    # Example: If drainage is 30%, failure score is 70
    drainage_val = ward_props.get('drainageCapacity', 50)
    drainage_risk = 100 - drainage_val
    
    # 2. Rainfall Factor (Normalized: 150mm is catastrophic/100%)
    rainfall = ward_props.get('rainfall', settings.DEFAULT_RAINFALL_MM)
    rainfall_risk = min((rainfall / 150) * 100, 100)
    
    # 3. Complaints Factor (Each complaint adds 15 points, max 100)
    # This ensures citizen feedback directly impacts the risk score.
    complaints = ward_props.get('activeComplaints', 0)
    complaint_risk = min(complaints * 15, 100)
    
    # Weighted Calculation
    final_score = (
        (drainage_risk * settings.WEIGHT_DRAINAGE) +
        (rainfall_risk * settings.WEIGHT_RAINFALL) +
        (complaint_risk * settings.WEIGHT_COMPLAINTS)
    )
    
    return round(final_score, 1)

def classify_risk(score):
    """
    Categorizes the numeric score into a readable label.
    """
    if score >= settings.RISK_HIGH_THRESHOLD:
        return "High"
    elif score >= settings.RISK_MEDIUM_THRESHOLD:
        return "Medium"
    return "Low"