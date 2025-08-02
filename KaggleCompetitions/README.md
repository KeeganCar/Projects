# Kaggle Competitions Overview

## Fertilizer Prediction (XGBoost Classifier)
- Combined multiple agricultural datasets (competition and external) to enhance training data and improve prediction accuracy.
- Engineered preprocessing pipeline with `OneHotEncoder` and `LabelEncoder` for categorical feature handling.
- Trained `XGBoost` classifier with weighted samples to prioritize domain-relevant data, reducing overfitting.
- Generated final submission file predicting optimal fertilizer type for each test case.

## Personality Type Classification (Custom Weighted KNN)
- Implemented custom Weighted KNN algorithm from scratch to classify introvert/extrovert personality types.
- Designed feature-weighting scheme to prioritize socially impactful variables such as `Time_spent_Alone`.
- Preprocessed categorical survey data by normalizing missing values and enforcing consistent feature types.
- Produced competition submission with tuned K-value (`K=51`) and custom decision threshold for classification.
