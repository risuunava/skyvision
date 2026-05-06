import numpy as np
import pandas as pd
from typing import List
from sklearn.preprocessing import MinMaxScaler


class WeatherPreprocessor:
    """Preprocessing utilities for weather data"""

    def __init__(self):
        self.scaler = MinMaxScaler()
        self.features = ['temperature', 'humidity', 'wind_speed', 'cloud_cover', 'hour', 'day_of_week']

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values — forward-fill then backward-fill then median."""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df[col] = df[col].ffill()          # pandas >= 2.0 API
            df[col] = df[col].bfill()
            df[col] = df[col].fillna(df[col].median())
        return df

    def remove_outliers(self, df: pd.DataFrame, columns: List[str] | None = None) -> pd.DataFrame:
        """Remove outliers using the IQR method."""
        if columns is None:
            columns = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']

        for col in columns:
            if col not in df.columns:
                continue
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            df = df[(df[col] >= q1 - 1.5 * iqr) & (df[col] <= q3 + 1.5 * iqr)]

        return df.reset_index(drop=True)

    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add cyclic time encodings and rolling statistics."""
        df = df.copy()

        # Cyclic time features
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin']  = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos']  = np.cos(2 * np.pi * df['day_of_week'] / 7)

        # Rolling means (3h and 6h)
        for col in ['temperature', 'humidity', 'wind_speed', 'cloud_cover']:
            if col in df.columns:
                df[f'{col}_ma3'] = df[col].rolling(3, min_periods=1).mean()
                df[f'{col}_ma6'] = df[col].rolling(6, min_periods=1).mean()
                df[f'{col}_diff'] = df[col].diff().fillna(0)

        return df.fillna(0)

    def normalize(self, data: np.ndarray) -> np.ndarray:
        """Fit-transform data to [0, 1]."""
        return self.scaler.fit_transform(data)

    def denormalize(self, data: np.ndarray) -> np.ndarray:
        """Inverse-transform back to original scale."""
        return self.scaler.inverse_transform(data)

    def prepare_sequence(self, df: pd.DataFrame, seq_len: int = 24) -> np.ndarray:
        """
        Extract the last `seq_len` rows as a numpy array ready for LSTM inference.
        Returns shape (1, seq_len, n_features).
        """
        data = df[self.features].values
        if len(data) < seq_len:
            # Pad by repeating the first row
            pad = np.repeat(data[:1], seq_len - len(data), axis=0)
            data = np.vstack([pad, data])
        data = data[-seq_len:]
        return data.reshape(1, seq_len, len(self.features))


if __name__ == '__main__':
    preprocessor = WeatherPreprocessor()
    print("✅ WeatherPreprocessor ready. Features:", preprocessor.features)