from src.services import data_loader

def get_admin_overview():
    """
    Prepares the payload for the Admin Dashboard.
    Returns:
        - wards: All wards sorted by risk (High -> Low) for the main table.
        - priorityWards: Top 5 highest risk wards for the sidebar.
    """
    sorted_wards = sorted(
        [w['properties'] for w in data_loader.DB_WARDS], 
        key=lambda x: x.get('riskScore', 0), 
        reverse=True
    )
    
    return {
        "wards": sorted_wards,
        "priorityWards": sorted_wards[:5]
    }

def update_drainage_capacity(ward_id: str, capacity: int, is_cleaned: bool):
    """
    Handles the admin action to update drainage.
    Delegates to data_loader to save to CSV and recalculate risks.
    """
    success = data_loader.update_drainage_in_csv(ward_id, capacity)
    return success