from src.services import data_loader

def get_admin_overview():
    # Build dashboard data: wards sorted by risk + top 5 for quick view
    sorted_wards = sorted(
        [w["properties"] for w in data_loader.DB_WARDS],
        key=lambda x: x.get("riskScore", 0),
        reverse=True,
    )
    return {"wards": sorted_wards, "priorityWards": sorted_wards[:5]}

def update_drainage_capacity(ward_id: str, capacity: int, is_cleaned: bool):
    # Persist drainage update and let loader handle risk recalculation
    success = data_loader.update_drainage_in_csv(ward_id, capacity)
    return success