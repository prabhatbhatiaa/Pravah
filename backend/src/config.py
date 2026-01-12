import os

class Settings:
    # Project root (backend/)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Local data folder (backend/data/)
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # CSV sources used by the loader
    WARDS_FILE = os.path.join(DATA_DIR, "wards.csv")
    RAINFALL_FILE = os.path.join(DATA_DIR, "rainfall.csv")
    DRAINAGE_FILE = os.path.join(DATA_DIR, "drainage.csv")
    COMPLAINTS_FILE = os.path.join(DATA_DIR, "complaints.csv")

    # Risk weights (should add up to 1.0)
    WEIGHT_DRAINAGE = 0.5
    WEIGHT_RAINFALL = 0.3
    WEIGHT_COMPLAINTS = 0.2

    # Score cutoffs used for labels
    RISK_HIGH_THRESHOLD = 75
    RISK_MEDIUM_THRESHOLD = 40

    # Fallback rainfall when ward data is missing it
    DEFAULT_RAINFALL_MM = 45.0

settings = Settings()