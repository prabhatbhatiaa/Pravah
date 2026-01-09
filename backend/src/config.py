import os

class Settings:
    # Base Directory: Points to 'backend' folder
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Data Directory: Points to 'backend/data'
    DATA_DIR = os.path.join(BASE_DIR, "data")
    
    # CSV File Paths
    WARDS_FILE = os.path.join(DATA_DIR, "wards.csv")
    RAINFALL_FILE = os.path.join(DATA_DIR, "rainfall.csv")
    DRAINAGE_FILE = os.path.join(DATA_DIR, "drainage.csv")
    COMPLAINTS_FILE = os.path.join(DATA_DIR, "complaints.csv")
    
    # Risk Calculation Weights (Must sum to 1.0)
    WEIGHT_DRAINAGE = 0.5   
    WEIGHT_RAINFALL = 0.3   
    WEIGHT_COMPLAINTS = 0.2 

    # Risk Thresholds
    RISK_HIGH_THRESHOLD = 75
    RISK_MEDIUM_THRESHOLD = 40
    
    # Defaults
    DEFAULT_RAINFALL_MM = 45.0

settings = Settings()