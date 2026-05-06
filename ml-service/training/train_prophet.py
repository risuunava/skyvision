"""
train_prophet.py — SkyVision Prophet Weather Prediction Training
Usage:
    cd ml-service
    python training/train_prophet.py
Output:
    model/saved/prophet_temperature.pkl
    model/saved/prophet_humidity.pkl
    model/saved/prophet_wind_speed.pkl
    model/saved/prophet_cloud_cover.pkl
"""

import os, sys, logging
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
import numpy as np
import joblib

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample.csv')
SAVE_DIR  = os.path.join(os.path.dirname(__file__), '..', 'model', 'saved')
TARGETS   = ['temperature', 'humidity', 'wind_speed', 'cloud_cover']
os.makedirs(SAVE_DIR, exist_ok=True)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    try:
        from prophet import Prophet
    except ImportError:
        logger.error("Install Prophet: pip install prophet==1.1.5")
        sys.exit(1)

    if not os.path.exists(DATA_PATH):
        logger.error(f"Dataset not found: {DATA_PATH}")
        logger.info("Run: cd ml-service && python data/generate_sample.py")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH, parse_dates=['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    df[TARGETS] = df[TARGETS].ffill().bfill()

    logger.info(f"Loaded {len(df)} rows for Prophet training")

    for target in TARGETS:
        logger.info(f"Training Prophet for '{target}' …")

        # Prophet requires 'ds' and 'y' columns
        prophet_df = df[['timestamp', target]].rename(columns={'timestamp': 'ds', target: 'y'})

        model = Prophet(
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=True,
        )

        # Add hourly seasonality for weather (period=24h)
        model.add_seasonality(name='hourly', period=1, fourier_order=8)

        # Fit on ~80% of data
        split = int(len(prophet_df) * 0.8)
        model.fit(prophet_df.iloc[:split])

        # Quick evaluation on last 20%
        future = pd.DataFrame({'ds': prophet_df['ds'].iloc[split:]})
        forecast = model.predict(future)
        y_true = prophet_df['y'].iloc[split:].values
        y_pred = forecast['yhat'].values
        mae  = float(np.mean(np.abs(y_true - y_pred)))
        rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
        logger.info(f"  {target}: MAE={mae:.3f}, RMSE={rmse:.3f}")

        # Save
        save_path = os.path.join(SAVE_DIR, f'prophet_{target}.pkl')
        joblib.dump(model, save_path)
        logger.info(f"  ✅ Saved → {save_path}")

    logger.info("All Prophet models saved successfully.")

if __name__ == '__main__':
    main()