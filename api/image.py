from flask import Flask, request, jsonify
import tensorflow as tf
from PIL import Image, ImageOps
import numpy as np
from flask_cors import CORS
import io

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}})

# Load the model
model = tf.keras.models.load_model("E:/walmart/api/dst/keras_model.h5", compile=False)

# Load the labels, stripping newline characters
with open("E:/walmart/api/dst/labels.txt", "r") as f:
    class_names = [line.strip() for line in f.readlines()]

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    image_file = request.files['image']
    print("1", image_file)

    try:
        image = Image.open(image_file.stream).convert("RGB")
    except OSError:
        return jsonify({'error': 'Invalid image file'}), 400

    image = ImageOps.fit(image, (224, 224), Image.Resampling.LANCZOS)
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    data[0] = normalized_image_array

    prediction = model.predict(data)
    index = np.argmax(prediction)
    class_name = class_names[index]
    
    result = f"{class_name}"
    return jsonify({'prediction': result}) 

if __name__ == '__main__':
    app.run(debug=True)
