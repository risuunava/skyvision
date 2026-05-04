from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
from tensorflow.keras.models import load_model
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SkyVision ML Service", version="1.0.0")

# Load models at startup
@app.on_event("startup")
async def load_models():
    global lstm_model, scaler_X, scaler_y, prophet_models
    
    try:
        # Load LSTM
        lstm_model = load_model('model/saved/lstm_model.h5')
        scaler_X = joblib.load('model/saved/scaler_X.pkl')
        scaler_y = joblib.load('model/saved/scaler_y.pkl')
        logger.info("LSTM model loaded successfully")
        
        # Load Prophet
        prophet_models = {}
        features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
        for feature in features:
            prophet_models[feature] = joblib.load(f'model/saved/prophet_{feature}.pkl')
        logger.info("Prophet models loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        # Initialize with None if models don't exist
        lstm_model = None
        prophet_models = {}

# Request/Response Models
class WeatherData(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    cloud_cover: float
    hour: int
    day_of_week: int
    timestamp: str

class PredictionRequest(BaseModel):
    city_id: int
    city_name: str
    model_type: str = "lstm"  # lstm or prophet
    weather_data: List[WeatherData]

class PredictionResult(BaseModel):
    timestamp: str
    temperature: float
    humidity: float
    wind_speed: float
    cloud_cover: float
    confidence: float
    risk_level: str
    risk_score: float

class PredictionResponse(BaseModel):
    city_id: int
    city_name: str
    model_type: str
    predictions: List[PredictionResult]
    generated_at: str

def calculate_risk_level(predictions: dict) -> tuple:
    """Calculate risk level based on weather predictions"""
    risk_score = 0
    
    # Temperature extremes (>35°C or <15°C)
    if predictions['temperature'] > 35 or predictions['temperature'] < 15:
        risk_score += 0.3
    
    # High wind speed (>40 km/h)
    if predictions['wind_speed'] > 40:
        risk_score += 0.25
    
    # High humidity (>90%)
    if predictions['humidity'] > 90:
        risk_score += 0.2
    
    # High cloud cover (>80%)
    if predictions['cloud_cover'] > 80:
        risk_score += 0.25
    
    # Determine risk level
    if risk_score >= 0.7:
        return 'extreme', risk_score
    elif risk_score >= 0.5:
        return 'high', risk_score
    elif risk_score >= 0.3:
        return 'medium', risk_score
    else:
        return 'low', risk_score

def predict_lstm(weather_data: List[WeatherData]) -> List[dict]:
    """Make predictions using LSTM model"""
    if lstm_model is None:
        raise HTTPException(status_code=500, detail="LSTM model not loaded")
    
    # Prepare input data
    features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover', 'hour', 'day_of_week']
    
    input_data = []
    for data in weather_data[-24:]:  # Use last 24 data points
        input_data.append([
            data.temperature,
            data.humidity,
            data.wind_speed,
            data.cloud_cover,
            data.hour,
            data.day_of_week
        ])
    
    # Scale input
    input_scaled = scaler_X.transform(input_data)
    input_reshaped = input_scaled.reshape(1, 24, 6)
    
    # Make prediction for next 24 hours
    predictions = []
    current_input = input_reshaped.copy()
    
    for hour in range(24):
        # Predict next hour
        pred = lstm_model.predict(current_input, verbose=0)
        
        # Inverse transform
        pred_original = scaler_y.inverse_transform(pred[0])
        
        # Calculate timestamp
        last_timestamp = datetime.fromisoformat(weather_data[-1].timestamp)
        next_timestamp = last_timestamp + timedelta(hours=hour + 1)
        
        # Calculate risk level
        pred_dict = {
            'temperature': float(pred_original[0]),
            'humidity': float(pred_original[1]),
            'wind_speed': float(pred_original[2]),
            'cloud_cover': float(pred_original[3]),
        }
        risk_level, risk_score = calculate_risk_level(pred_dict)
        
        predictions.append({
            'timestamp': next_timestamp.isoformat(),
            **pred_dict,
            'confidence': 0.85,  # This should be calculated properly
            'risk_level': risk_level,
            'risk_score': risk_score
        })
        
        # Update input for next prediction
        # Shift the sequence and add new prediction
        new_row = np.array([[
            pred_original[0], pred_original[1], pred_original[2], pred_original[3],
            next_timestamp.hour, next_timestamp.weekday()
        ]])
        new_row_scaled = scaler_X.transform(new_row)
        current_input = np.append(current_input[:, 1:, :], new_row_scaled.reshape(1, 1, 6), axis=1)
    
    return predictions

def predict_prophet(weather_data: List[WeatherData]) -> List[dict]:
    """Make predictions using Prophet models"""
    if not prophet_models:
        raise HTTPException(status_code=500, detail="Prophet models not loaded")
    
    last_timestamp = datetime.fromisoformat(weather_data[-1].timestamp)
    
    # Create future dataframe
    future_dates = pd.date_range(
        start=last_timestamp + timedelta(hours=1),
        periods=24,
        freq='H'
    )
    
    predictions = []
    temp_predictions = {}
    
    # Predict each feature
    for feature, model in prophet_models.items():
        future_df = pd.DataFrame({'ds': future_dates})
        forecast = model.predict(future_df)
        temp_predictions[feature] = forecast['yhat'].values
    
    # Combine predictions
    for i, date in enumerate(future_dates):
        pred_dict = {
            'temperature': float(temp_predictions['temperature'][i]),
            'humidity': float(temp_predictions['humidity'][i]),
            'wind_speed': float(temp_predictions['wind_speed'][i]),
            'cloud_cover': float(temp_predictions['cloud_cover'][i]),
        }
        
        risk_level, risk_score = calculate_risk_level(pred_dict)
        
        predictions.append({
            'timestamp': date.isoformat(),
            **pred_dict,
            'confidence': 0.80,  # Prophet's confidence score
            'risk_level': risk_level,
            'risk_score': risk_score
        })
    
    return predictions

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Main prediction endpoint"""
    try:
        logger.info(f"Prediction request for {request.city_name} using {request.model_type}")
        
        if request.model_type == 'lstm':
            predictions = predict_lstm(request.weather_data)
        elif request.model_type == 'prophet':
            predictions = predict_prophet(request.weather_data)
        else:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        return PredictionResponse(
            city_id=request.city_id,
            city_name=request.city_name,
            model_type=request.model_type,
            predictions=predictions,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "lstm_loaded": lstm_model is not None,
        "prophet_loaded": bool(prophet_models),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)