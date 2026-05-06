import os
import joblib
import pandas as pd
import numpy as np

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'model', 'saved')
os.makedirs(SAVE_DIR, exist_ok=True)

class MockProphet:
    def __init__(self, base_val, variance):
        self.base_val = base_val
        self.variance = variance
        
    def predict(self, future_df):
        n = len(future_df)
        # Create a fake forecast with yhat
        yhat = self.base_val + np.random.normal(0, self.variance, n)
        # Add some sine wave for daily seasonality
        hours = future_df['ds'].dt.hour
        yhat += np.sin(hours * np.pi / 12) * (self.variance * 2)
        
        return pd.DataFrame({'ds': future_df['ds'], 'yhat': yhat})

if __name__ == '__main__':
    targets = {
        'temperature': (28.0, 1.5),
        'humidity': (75.0, 5.0),
        'wind_speed': (12.0, 2.0),
        'cloud_cover': (60.0, 10.0)
    }
    
    for feat, (base_val, var) in targets.items():
        model = MockProphet(base_val, var)
        save_path = os.path.join(SAVE_DIR, f'prophet_{feat}.pkl')
        joblib.dump(model, save_path)
        print(f"Created mock Prophet model for {feat}")
