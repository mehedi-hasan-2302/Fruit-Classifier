import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import preprocess_image, CLASS_NAMES
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def load_model():
    """
    Load the model with custom object handling
    """
    print("🔄 Loading model.h5...")
    try:
        custom_objects = {
            'InputLayer': tf.keras.layers.InputLayer
        }
        
        model = tf.keras.models.load_model('model.h5', custom_objects=custom_objects)
        print("Model loaded successfully!")
        model.summary()
        return model
    except Exception as e1:
        print(f"First attempt failed: {e1}")
        
   
        try:
            print("🔄 Trying alternative loading method...")
            
          
            with tf.keras.utils.custom_object_scope(custom_objects):
                model = tf.keras.models.load_model('model.h5', compile=False)
            
        
            model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            print("✅ Model loaded with alternative method!")
            model.summary()
            return model
            
        except Exception as e2:
            print(f"❌ Alternative method also failed: {e2}")
            
            try:
                print("🔄 Attempting to recreate model architecture...")
                return create_model_and_load_weights()
            except Exception as e3:
                print(f"❌ Could not recreate model: {e3}")
                return None

def create_model_and_load_weights():
    """
    Recreate the model architecture based on your notebook
    """
    print("🏗️  Recreating model architecture...")
    
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'
    )
    
    inputs = base_model.input
    x = tf.keras.layers.Dense(128, activation='relu')(base_model.output)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    outputs = tf.keras.layers.Dense(36, activation='softmax')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=outputs)
    
    
    try:
        model.load_weights('model.h5')
        print("Weights loaded successfully!")
    except:
        print("Could not load weights - model will use random initialization")
    
    return model

print("Starting model loading...")
model = load_model()

if model is None:
    print("Could not load model!")
    exit(1)

print("Model ready!")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "loaded",
        "classes": len(CLASS_NAMES),
        "input_shape": [224, 224, 3]
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    if 'file' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        img_bytes = file.read()
        processed_image = preprocess_image(img_bytes)
        
        print(f"Processing image: {file.filename}")
        print(f"Processed image shape: {processed_image.shape}")
        
        predictions = model.predict(processed_image, verbose=0)
        pred_probs = predictions[0]
        
        top_5_indices = np.argsort(pred_probs)[::-1][:5]
        top_5_classes = [CLASS_NAMES[i] for i in top_5_indices]
        top_5_probs = [float(pred_probs[i]) for i in top_5_indices]
        
        # Format results
        results = [
            {
                "class": cls, 
                "confidence": f"{prob*100:.2f}%",
                "probability": round(float(prob), 4)
            } 
            for cls, prob in zip(top_5_classes, top_5_probs)
        ]
        
        print(f"Top prediction: {results[0]['class']} ({results[0]['confidence']})")
        
        return jsonify({
            "predictions": results,
            "total_classes": len(CLASS_NAMES),
            "image_processed": True
        })
    
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get available classes"""
    return jsonify({
        "classes": CLASS_NAMES,
        "total": len(CLASS_NAMES)
    })

@app.route('/debug/predict', methods=['POST'])
def debug_predict():
    """Debug endpoint to check preprocessing"""
    if 'file' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        file = request.files['file']
        img_bytes = file.read()
        processed_image = preprocess_image(img_bytes)
        
        predictions = model.predict(processed_image, verbose=0)
        pred_probs = predictions[0]
        
        # Debug info
        return jsonify({
            "input_shape": processed_image.shape,
            "input_range": [float(np.min(processed_image)), float(np.max(processed_image))],
            "prediction_shape": predictions.shape,
            "sum_probabilities": float(np.sum(pred_probs)),
            "max_probability": float(np.max(pred_probs)),
            "min_probability": float(np.min(pred_probs)),
            "top_prediction": CLASS_NAMES[np.argmax(pred_probs)],
            "top_confidence": float(np.max(pred_probs))
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)