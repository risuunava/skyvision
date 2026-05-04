import pandas as pd
import numpy as np
from prophet import Prophet
import joblib
import os

class WeatherProphet:
    def __init__(self):
        self.models = {}
        self.features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
        
    def prepare_data(self, data_path):
        """Prepare data for Prophet"""
        df = pd.read_csv(data_path)
        df['ds'] = pd.to_datetime(df['timestamp'])
        return df
    
    def train(self, data_path):
        """Train Prophet models for each feature"""
        df = self.prepare_data(data_path)
        
        for feature in self.features:
            print(f"Training Prophet for {feature}...")
            
            # Prepare data for Prophet
            prophet_df = df[['ds', feature]].rename(columns={feature: 'y'})
            
            # Remove outliers (optional)
            q1 = prophet_df['y'].quantile(0.25)
            q3 = prophet_df['y'].quantile(0.75)
            iqr = q3 - q1
            prophet_df = prophet_df[
                (prophet_df['y'] >= q1 - 1.5 * iqr) & 
                (prophet_df['y'] <= q3 + 1.5 * iqr)
            ]
            
            # Create and train model
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=True,
                changepoint_prior_scale=0.05
            )
            
            model.fit(prophet_df)
            self.models[feature] = model
            
        return self.models
    
    def save_models(self, path='model/saved'):
        """Save Prophet models"""
        os.makedirs(path, exist_ok=True)
        for feature, model in self.models.items():
            joblib.dump(model, f'{path}/prophet_{feature}.pkl')
            
    def load_models(self, path='model/saved'):
        """Load Prophet models"""
        for feature in self.features:
            model_path = f'{path}/prophet_{feature}.pkl'
            if os.path.exists(model_path):
                self.models[feature] = joblib.load(model_path)

if __name__ == '__main__':
    prophet = WeatherProphet()
    prophet.train('data/weather_history.csv')
    prophet.save_models()
    print("Prophet Models trained and saved successfully!")