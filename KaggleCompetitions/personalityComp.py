# Keegan Carnell
# July 2025
# This script implements a custom weighted K-Nearest Neighbors (KNN) algorithm
# to predict personality types (Introvert/Extrovert) based on survey data.
# It handles categorical features by treating them as distinct values and
# assigns custom weights to different features for similarity calculation.

import pandas as pd
import numpy as np
from tqdm import tqdm 

# Data Loading and Preparation
# Load data.
try:
    train_df = pd.read_csv('train.csv')
    test_df = pd.read_csv('test.csv')
except FileNotFoundError as e:
    print(f"Error: {e}. Confirm all files in the correct directory.")
    exit()

# Store test IDs for submission.
test_ids = test_df['id']

# Combine train and test for consistent preprocessing.
test_df['Personality'] = np.nan
all_df = pd.concat([train_df, test_df], ignore_index=True)

# Fill NaNs with 'missing'. Convert all relevant columns to string.
for col in all_df.columns:
    if col not in ['id', 'Personality']:
        all_df[col] = all_df[col].fillna('missing')
        all_df[col] = all_df[col].astype(str)

# Separate back into train and test sets.
train = all_df[all_df['Personality'].notna()].copy()
test = all_df[all_df['Personality'].isna()].drop(columns=['Personality']).copy()

# Encode target variable.
train['Personality_encoded'] = train['Personality'].map({'Introvert': 1, 'Extrovert': 0})

# Custom Weighted KNN Implementation
# Feature weights.
weights = {
    'Time_spent_Alone': 3,
    'Stage_fear': 2,
    'Social_event_attendance': 1,
    'Going_outside': 1,
    'Drained_after_socializing': 1,
    'Friends_circle_size': 1,
    'Post_frequency': 1
}

K = 51 # Number of neighbors.
feature_cols = list(weights.keys())

# Prepare data for faster processing.
X_train_np = train[feature_cols].to_numpy()
y_train_np = train['Personality_encoded'].to_numpy()
X_test_np = test[feature_cols].to_numpy()

votes = []

# Loop through test samples.
for test_row in tqdm(X_test_np, desc="Processing test samples"):
    # Calculate similarity scores.
    similarity_scores = (X_train_np == test_row) @ list(weights.values())

    # Find top K similar neighbors.
    top_k_indices = np.argsort(similarity_scores)[-K:]

    # Get labels of top K neighbors.
    top_k_labels = y_train_np[top_k_indices]

    # Calculate mean vote.
    vote = top_k_labels.mean()
    votes.append(vote)

# Generate the Submission File
# Convert votes to Series.
test['votes'] = votes

# Apply custom threshold for personality.
test['Personality'] = np.where(test['votes'] > 0.75, 'Introvert', 'Extrovert')

# Create submission DataFrame.
submission_df = test[['id', 'Personality']]

# Save to CSV.
submission_df.to_csv('submission.csv', index=False)

print("\nSubmission file created.")
