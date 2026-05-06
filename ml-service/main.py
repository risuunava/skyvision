from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import logging
import os

class MockProphet:
    def __init__(self, base_val, variance):
        self.base_val = base_val
        self.variance = variance
        
    def predict(self, future_df):
        n = len(future_df)
        yhat = self.base_val + np.random.normal(0, self.variance, n)
        hours = future_df['ds'].dt.hour
        yhat += np.sin(hours * np.pi / 12) * (self.variance * 2)
        return pd.DataFrame({'ds': future_df['ds'], 'yhat': yhat})

# ── Setup ─────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkyVision ML Service",
    description="Weather prediction API using LSTM and Prophet models",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global model state ────────────────────────────────────────────────────────
lstm_model    = None
scaler_X      = None
scaler_y      = None
prophet_models: dict = {}

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'model', 'saved')

SEQ_LEN  = 24
PRED_LEN = 24
N_FEATURES = 6   # temperature, humidity, wind_speed, cloud_cover, hour, day_of_week
N_TARGETS  = 4   # temperature, humidity, wind_speed, cloud_cover

# ── Startup: load models ──────────────────────────────────────────────────────
@app.on_event("startup")
async def load_models():
    global lstm_model, scaler_X, scaler_y, prophet_models

    # LSTM
    lstm_path = os.path.join(SAVE_DIR, 'lstm_model.h5')
    scaler_X_path = os.path.join(SAVE_DIR, 'scaler_X.pkl')
    scaler_y_path = os.path.join(SAVE_DIR, 'scaler_y.pkl')

    if os.path.exists(lstm_path):
        try:
            from tensorflow.keras.models import load_model
            lstm_model = load_model(lstm_path)
            scaler_X   = joblib.load(scaler_X_path)
            scaler_y   = joblib.load(scaler_y_path)
            logger.info("✅ LSTM model loaded")
        except Exception as e:
            logger.error(f"LSTM load error: {e}")
            lstm_model = None
    else:
        logger.warning(f"LSTM model not found at {lstm_path}. Run training/train_lstm.py first.")

    # Prophet
    features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
    for feat in features:
        path = os.path.join(SAVE_DIR, f'prophet_{feat}.pkl')
        if os.path.exists(path):
            try:
                prophet_models[feat] = joblib.load(path)
            except Exception as e:
                logger.error(f"Prophet {feat} load error: {e}")

    if prophet_models:
        logger.info(f"✅ Prophet models loaded: {list(prophet_models.keys())}")
    else:
        logger.warning("Prophet models not found. Run training/train_prophet.py first.")

# ── Pydantic models ───────────────────────────────────────────────────────────
class WeatherInput(BaseModel):
    temperature: float
    humidity:    float
    wind_speed:  float
    cloud_cover: float
    hour:        int
    day_of_week: int
    timestamp:   str

class PredictionRequest(BaseModel):
    city_id:      int
    city_name:    str
    model_type:   str = "lstm"
    weather_data: List[WeatherInput]

class PredictionResult(BaseModel):
    timestamp:   str
    temperature: float
    humidity:    float
    wind_speed:  float
    cloud_cover: float
    confidence:  float
    risk_level:  str
    risk_score:  float

class PredictionResponse(BaseModel):
    city_id:      int
    city_name:    str
    model_type:   str
    predictions:  List[PredictionResult]
    generated_at: str

# ── Risk calculation ──────────────────────────────────────────────────────────
def calculate_risk(pred: dict) -> tuple[str, float]:
    score = 0.0
    if pred['temperature'] > 35 or pred['temperature'] < 18:
        score += 0.30
    if pred['wind_speed'] > 40:
        score += 0.25
    if pred['humidity'] > 90:
        score += 0.20
    if pred['cloud_cover'] > 80:
        score += 0.25
    score = min(score, 1.0)

    if score >= 0.70:
        return 'extreme', score
    elif score >= 0.50:
        return 'high', score
    elif score >= 0.30:
        return 'medium', score
    return 'low', score

# ── LSTM prediction ───────────────────────────────────────────────────────────
def predict_lstm(weather_data: List[WeatherInput]) -> List[dict]:
    if lstm_model is None or scaler_X is None or scaler_y is None:
        raise HTTPException(status_code=503, detail="LSTM model not loaded. Run training/train_lstm.py first.")

    # Pad if fewer than 24 points
    data = list(weather_data)
    while len(data) < SEQ_LEN:
        data.insert(0, data[0])
    data = data[-SEQ_LEN:]

    input_arr = np.array([[
        d.temperature, d.humidity, d.wind_speed, d.cloud_cover, d.hour, d.day_of_week
    ] for d in data])

    input_scaled  = scaler_X.transform(input_arr)
    input_reshaped = input_scaled.reshape(1, SEQ_LEN, N_FEATURES)

    # Model outputs flat vector of shape (1, PRED_LEN * N_TARGETS)
    raw = lstm_model.predict(input_reshaped, verbose=0)[0]
    raw_reshaped = raw.reshape(PRED_LEN, N_TARGETS)
    pred_original = scaler_y.inverse_transform(raw_reshaped)

    last_ts = datetime.fromisoformat(weather_data[-1].timestamp.replace('Z', ''))
    results = []
    for i in range(PRED_LEN):
        next_ts = last_ts + timedelta(hours=i + 1)
        pred_dict = {
            'temperature': float(np.clip(pred_original[i, 0], 0, 50)),
            'humidity':    float(np.clip(pred_original[i, 1], 0, 100)),
            'wind_speed':  float(np.clip(pred_original[i, 2], 0, 120)),
            'cloud_cover': float(np.clip(pred_original[i, 3], 0, 100)),
        }
        risk_level, risk_score = calculate_risk(pred_dict)
        results.append({
            'timestamp':  next_ts.isoformat(),
            **pred_dict,
            'confidence': 0.85,
            'risk_level': risk_level,
            'risk_score': risk_score,
        })
    return results

# ── Prophet prediction ────────────────────────────────────────────────────────
def predict_prophet(weather_data: List[WeatherInput]) -> List[dict]:
    if not prophet_models:
        raise HTTPException(status_code=503, detail="Prophet models not loaded. Run training/train_prophet.py first.")

    last_ts = datetime.fromisoformat(weather_data[-1].timestamp.replace('Z', ''))
    future_dates = pd.date_range(start=last_ts + timedelta(hours=1), periods=PRED_LEN, freq='h')
    future_df = pd.DataFrame({'ds': future_dates})

    feat_preds: dict = {}
    for feat, model in prophet_models.items():
        forecast = model.predict(future_df)
        feat_preds[feat] = forecast['yhat'].values

    results = []
    for i, dt in enumerate(future_dates):
        pred_dict = {
            'temperature': float(np.clip(feat_preds.get('temperature', [28]*PRED_LEN)[i], 0, 50)),
            'humidity':    float(np.clip(feat_preds.get('humidity',    [70]*PRED_LEN)[i], 0, 100)),
            'wind_speed':  float(np.clip(feat_preds.get('wind_speed',  [10]*PRED_LEN)[i], 0, 120)),
            'cloud_cover': float(np.clip(feat_preds.get('cloud_cover', [50]*PRED_LEN)[i], 0, 100)),
        }
        risk_level, risk_score = calculate_risk(pred_dict)
        results.append({
            'timestamp':  dt.isoformat(),
            **pred_dict,
            'confidence': 0.80,
            'risk_level': risk_level,
            'risk_score': risk_score,
        })
    return results

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    logger.info(f"Predict → {request.city_name} [{request.model_type}]")
    try:
        if request.model_type == 'lstm':
            preds = predict_lstm(request.weather_data)
        elif request.model_type == 'prophet':
            preds = predict_prophet(request.weather_data)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown model_type: {request.model_type}")

        return PredictionResponse(
            city_id=request.city_id,
            city_name=request.city_name,
            model_type=request.model_type,
            predictions=preds,
            generated_at=datetime.now().isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {
        "status":         "healthy",
        "lstm_loaded":    lstm_model is not None,
        "prophet_loaded": bool(prophet_models),
        "timestamp":      datetime.now().isoformat(),
    }

@app.get("/")
async def root():
    return {
        "name":    "SkyVision ML Service",
        "version": "1.0.0",
        "docs":    "/docs",
        "health":  "/health",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=False)