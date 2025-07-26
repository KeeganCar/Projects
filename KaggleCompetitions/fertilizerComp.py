# Keegan Carnell
# June 2025
# This script processes agricultural data to predict the optimal fertilizer type.
# It combines multiple datasets, preprocesses features, and trains an XGBoost
# classifier to make predictions. The final output is a submission file with 
# predicted fertilizer names.

import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin
import warnings
from xgboost import XGBClassifier

# Ignore warnings.
warnings.filterwarnings("ignore", category=UserWarning)

# Data Loading
try:
    train_file_path = './train.csv'
    original_data_file_path = './Fertilizer Prediction.csv'
    test_file_path = './test.csv'
    
    df_train = pd.read_csv(train_file_path)
    df_original = pd.read_csv(original_data_file_path)
    df_test = pd.read_csv(test_file_path)
except FileNotFoundError as e:
    print(f"Error: {e}. Confirm all files in the correct directory.")
    exit()

print("Files loaded.")

# Data Preprocessing

# Store test IDs. Remove 'id' from test set.
test_ids = df_test['id']
if 'id' in df_test.columns:
    df_test.pop('id')
X_test = df_test 

# Remove 'id' from training set. Separate features and target.
if 'id' in df_train.columns:
    df_train.pop('id')
y_train_raw = df_train.pop('Fertilizer Name')
X_train_base = df_train

# The train dataset was given by the competition. The original was an older dataset we found from a couple years prior.
# Separate features and target for original dataset.
y_original_raw = df_original.pop('Fertilizer Name')
X_original_base = df_original

print("\nCombining datasets")
# Combine training and original datasets.
X_full_train = pd.concat([X_train_base, X_original_base], ignore_index=True)
y_full_train_raw = pd.concat([y_train_raw, y_original_raw], ignore_index=True)

# Assign higher weight to original data.
original_data_weight = 4.0
sample_weight = np.array(
    [1.0] * len(X_train_base) + [original_data_weight] * len(X_original_base)
)

print("\nEnconding labels")
# Encode categorical target labels to numbers.
le = LabelEncoder()
y_full_train_encoded = le.fit_transform(y_full_train_raw)

# --- Custom Transformer for Data Type Conversion ---
# Convert all DataFrame columns to string type.
class ConvertToStringTransformer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return X.astype(str)

# --- Model Pipeline ---
# Create a Scikit-learn Pipeline.
final_pipeline = Pipeline(steps=[
    ('string_converter', ConvertToStringTransformer()),
    ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=True)),
    ('xgbclassifier', XGBClassifier(
        objective='multi:softprob',
        eval_metric='mlogloss',
        random_state=42,
        n_jobs=-1,
        n_estimators=100,
        learning_rate=0.1,
        max_depth=3
    ))
])

# Define fit parameters for sample weights.
fit_params = {'xgbclassifier__sample_weight': sample_weight}

# --- Model Training and Prediction ---
print("Training Model");
# Train the pipeline.
final_pipeline.fit(X_full_train, y_full_train_encoded, **fit_params)

# Predict probabilities on test set.
y_test_pred_proba = final_pipeline.predict_proba(X_test)
best_pred_indices = np.argmax(y_test_pred_proba, axis=1)
# Convert numerical predictions back to names.
predicted_fertilizer_names = le.inverse_transform(best_pred_indices)

# Submission File Generation
# Create submission DataFrame.
submission_df = pd.DataFrame({
    'id': test_ids,
    'Fertilizer Name': predicted_fertilizer_names
})

submission_file_path = './submission.csv'
# Save to CSV.
submission_df.to_csv(submission_file_path, index=False)

print(f"\nSubmission file: {submission_file_path}")
