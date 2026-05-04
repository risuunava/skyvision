import numpy as np
import pandas as pd
from typing import Tuple, List
from sklearn.preprocessing import MinMaxScaler

class WeatherPreprocessor:
    """Preprocessing utilities for weather data"""
    
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover', 'hour', 'day_of_week']
        
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in weather data"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            # Forward fill
            df[col] = df[col].fillna(method='ffill')
            # Backward fill for remaining NaN
            df[col] = df[col].fillna(method='bfill')
            # Fill with median if still NaN
            df[col] = df[col].fillna(df[col].median())
            
        return df
    
    def remove_outliers(self, df: pd.DataFrame, columns: List[str] = None) -> pd.DataFrame:
        """Remove outliers using IQR method"""
        if columns is None:
            columns = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
            
        for col in columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
            
        return df
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create additional features for better prediction"""
        # Time-based features
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        
        # Rolling means
        for col in ['temperature', 'humidity', 'wind_speed', 'cloud_cover']:
            df[f'{col}_rolling_3h'] = df[col].rolling(window=3, min_periods=1).mean()
            df[f'{col}_rolling_6h'] = df[col].rolling(window=6, min_periods=1).mean()
            
        # Differences
        for col in ['temperature', 'humidity', 'wind_speed', 'cloud_cover']:
            df[f'{col}_diff'] = df[col].diff()
            
        return df.fillna(0)
    
    def normalize(self, data: np.ndarray) -> np.ndarray:
        """Normalize data to [0, 1] range"""
        return self.scaler.fit_transform(data)
    
    def denormalize(self, data: np.ndarray) -> np.ndarray:
        """Denormalize data back to original scale"""
        return self.scaler.inverse_transform(data)

# Usage example
if __name__ == '__main__':
    preprocessor = WeatherPreprocessor()
    # df = pd.read_csv('data/weather.csv')
    # df = preprocessor.handle_missing_values(df)
    # df = preprocessor.remove_outliers(df)
    # df = preprocessor.create_features(df)
    print("Preprocessing utilities ready!")