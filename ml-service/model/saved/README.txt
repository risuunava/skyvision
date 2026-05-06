# This directory stores trained ML model files.
# Run training scripts to generate these files:
#
#   cd ml-service
#   python data/generate_sample.py        # 1. Generate training data
#   python training/train_lstm.py          # 2. Train LSTM → lstm_model.h5, scaler_X.pkl, scaler_y.pkl
#   python training/train_prophet.py       # 3. Train Prophet → prophet_*.pkl
#
# Expected files after training:
#   lstm_model.h5
#   scaler_X.pkl
#   scaler_y.pkl
#   prophet_temperature.pkl
#   prophet_humidity.pkl
#   prophet_wind_speed.pkl
#   prophet_cloud_cover.pkl
