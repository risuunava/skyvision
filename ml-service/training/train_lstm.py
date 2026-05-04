import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

class WeatherLSTM:
    def __init__(self, sequence_length=24, features=6):
        self.sequence_length = sequence_length
        self.features = features
        self.model = None
        self.scaler_X = MinMaxScaler()
        self.scaler_y = MinMaxScaler()
        
    def prepare_data(self, data_path):
        """Prepare training data from CSV"""
        df = pd.read_csv(data_path)
        
        # Assume columns: temperature, humidity, wind_speed, cloud_cover, hour, day_of_week
        features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover', 'hour', 'day_of_week']
        target = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
        
        X = df[features].values
        y = df[target].values
        
        # Scale the data
        X_scaled = self.scaler_X.fit_transform(X)
        y_scaled = self.scaler_y.fit_transform(y)
        
        # Create sequences
        X_seq, y_seq = [], []
        for i in range(len(X_scaled) - self.sequence_length):
            X_seq.append(X_scaled[i:i+self.sequence_length])
            y_seq.append(y_scaled[i+self.sequence_length])
            
        return np.array(X_seq), np.array(y_seq)
    
    def build_model(self):
        """Build LSTM model architecture"""
        self.model = Sequential([
            LSTM(128, return_sequences=True, input_shape=(self.sequence_length, self.features)),
            Dropout(0.2),
            LSTM(64, return_sequences=True),
            Dropout(0.2),
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(4)  # 4 output features
        ])
        
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
    def train(self, data_path, epochs=100, batch_size=32, validation_split=0.2):
        """Train the LSTM model"""
        X, y = self.prepare_data(data_path)
        
        self.build_model()
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def save_model(self, path='model/saved'):
        """Save model and scalers"""
        os.makedirs(path, exist_ok=True)
        self.model.save(f'{path}/lstm_model.h5')
        joblib.dump(self.scaler_X, f'{path}/scaler_X.pkl')
        joblib.dump(self.scaler_y, f'{path}/scaler_y.pkl')
        
    def load_model(self, path='model/saved'):
        """Load model and scalers"""
        from tensorflow.keras.models import load_model
        self.model = load_model(f'{path}/lstm_model.h5')
        self.scaler_X = joblib.load(f'{path}/scaler_X.pkl')
        self.scaler_y = joblib.load(f'{path}/scaler_y.pkl')

if __name__ == '__main__':
    # Example usage
    lstm = WeatherLSTM()
    history = lstm.train('data/weather_history.csv')
    lstm.save_model()
    print("LSTM Model trained and saved successfully!")