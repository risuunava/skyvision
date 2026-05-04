import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from typing import Dict, Tuple

class ModelMetrics:
    """Calculate model performance metrics"""
    
    @staticmethod
    def calculate_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculate regression metrics"""
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        
        # Mean Absolute Percentage Error
        mape = np.mean(np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), 1e-10))) * 100
        
        # Explained Variance
        ev = 1 - np.var(y_true - y_pred) / np.var(y_true)
        
        return {
            'mse': float(mse),
            'rmse': float(rmse),
            'mae': float(mae),
            'r2': float(r2),
            'mape': float(mape),
            'explained_variance': float(ev)
        }
    
    @staticmethod
    def calculate_risk_metrics(y_true: np.ndarray, y_pred: np.ndarray, 
                               thresholds: Dict[str, float]) -> Dict[str, float]:
        """Calculate risk prediction metrics"""
        # Convert to risk levels
        def to_risk_level(values, threshold):
            levels = np.zeros_like(values, dtype=int)
            for i, v in enumerate(values):
                if v > threshold['high']:
                    levels[i] = 3  # extreme
                elif v > threshold['medium']:
                    levels[i] = 2  # high
                elif v > threshold['low']:
                    levels[i] = 1  # medium
            return levels
        
        risk_true = to_risk_level(y_true, thresholds)
        risk_pred = to_risk_level(y_pred, thresholds)
        
        # Accuracy
        accuracy = np.mean(risk_true == risk_pred)
        
        # Precision, Recall, F1 for each risk level
        metrics = {'accuracy': float(accuracy)}
        
        for level in range(4):
            true_pos = np.sum((risk_true == level) & (risk_pred == level))
            false_pos = np.sum((risk_true != level) & (risk_pred == level))
            false_neg = np.sum((risk_true == level) & (risk_pred != level))
            
            precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
            recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            
            level_names = {0: 'low', 1: 'medium', 2: 'high', 3: 'extreme'}
            metrics[f'{level_names[level]}_precision'] = float(precision)
            metrics[f'{level_names[level]}_recall'] = float(recall)
            metrics[f'{level_names[level]}_f1'] = float(f1)
        
        return metrics
    
    @staticmethod
    def calculate_confidence_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate confidence score based on prediction error"""
        error = np.abs(y_true - y_pred)
        mean_error = np.mean(error, axis=0)
        
        # Convert error to confidence score (0 to 1)
        # Lower error = higher confidence
        confidence = 1 / (1 + mean_error)
        
        # Average across all features
        return float(np.mean(confidence))

# Usage example
if __name__ == '__main__':
    metrics_calculator = ModelMetrics()
    y_true = np.random.randn(100, 4)
    y_pred = np.random.randn(100, 4)
    
    regression_metrics = metrics_calculator.calculate_regression_metrics(y_true, y_pred)
    print("Regression Metrics:", regression_metrics)