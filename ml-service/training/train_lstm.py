"""
train_lstm.py — SkyVision LSTM Weather Prediction Training
Usage:
    cd ml-service
    python training/train_lstm.py
Output:
    model/saved/lstm_model.h5
    model/saved/scaler_X.pkl
    model/saved/scaler_y.pkl
"""

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import numpy as np
import pandas as pd
import joblib
import logging
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
DATA_PATH   = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample.csv')
SAVE_DIR    = os.path.join(os.path.dirname(__file__), '..', 'model', 'saved')
SEQ_LEN     = 24   # 24-hour input window
PRED_LEN    = 24   # predict next 24 hours
FEATURES    = ['temperature', 'humidity', 'wind_speed', 'cloud_cover', 'hour', 'day_of_week']
TARGETS     = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
EPOCHS      = 30
BATCH_SIZE  = 64
os.makedirs(SAVE_DIR, exist_ok=True)

# ── Load & prepare data ───────────────────────────────────────────────────────
def load_data():
    if not os.path.exists(DATA_PATH):
        logger.error(f"Dataset not found: {DATA_PATH}")
        logger.info("Run: cd ml-service && python data/generate_sample.py")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH, parse_dates=['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)

    # Forward-fill missing values
    df[FEATURES] = df[FEATURES].ffill().bfill()

    logger.info(f"Loaded {len(df)} rows, columns: {list(df.columns)}")
    return df

def create_sequences(data_X: np.ndarray, data_y: np.ndarray):
    X, y = [], []
    for i in range(len(data_X) - SEQ_LEN - PRED_LEN + 1):
        X.append(data_X[i : i + SEQ_LEN])
        y.append(data_y[i + SEQ_LEN : i + SEQ_LEN + PRED_LEN])
    return np.array(X), np.array(y)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
        from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
        logger.info(f"TensorFlow {tf.__version__}")
    except ImportError:
        logger.error("Install TensorFlow: pip install tensorflow==2.15.0")
        sys.exit(1)

    # 1. Load
    df = load_data()

    # 2. Scale
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()
    X_scaled = scaler_X.fit_transform(df[FEATURES].values)
    y_scaled = scaler_y.fit_transform(df[TARGETS].values)

    # 3. Sequences
    X, y = create_sequences(X_scaled, y_scaled)
    logger.info(f"Sequences → X: {X.shape}, y: {y.shape}")

    # 4. Train/val split
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, shuffle=False)
    logger.info(f"Train: {X_train.shape}, Val: {X_val.shape}")

    # 5. Build model
    model = Sequential([
        LSTM(128, input_shape=(SEQ_LEN, len(FEATURES)), return_sequences=True),
        BatchNormalization(),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        BatchNormalization(),
        Dropout(0.2),
        Dense(64, activation='relu'),
        Dense(PRED_LEN * len(TARGETS)),
    ])

    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    model.summary()

    # 6. Callbacks
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, verbose=1),
        ModelCheckpoint(os.path.join(SAVE_DIR, 'lstm_best.h5'), save_best_only=True, verbose=0),
    ]

    # 7. Train
    # Reshape y to (samples, PRED_LEN * TARGETS) for Dense output
    y_train_flat = y_train.reshape(len(y_train), -1)
    y_val_flat   = y_val.reshape(len(y_val),   -1)

    history = model.fit(
        X_train, y_train_flat,
        validation_data=(X_val, y_val_flat),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )

    # 8. Save
    model_path = os.path.join(SAVE_DIR, 'lstm_model.h5')
    model.save(model_path)
    joblib.dump(scaler_X, os.path.join(SAVE_DIR, 'scaler_X.pkl'))
    joblib.dump(scaler_y, os.path.join(SAVE_DIR, 'scaler_y.pkl'))

    final_val_loss = min(history.history['val_loss'])
    final_val_mae  = min(history.history['val_mae'])
    logger.info(f"✅ Model saved → {model_path}")
    logger.info(f"   Best val_loss={final_val_loss:.6f}, val_mae={final_val_mae:.6f}")

if __name__ == '__main__':
    main()