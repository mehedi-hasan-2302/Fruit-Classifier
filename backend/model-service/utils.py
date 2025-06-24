import numpy as np
from PIL import Image, ImageOps
import io
import tensorflow as tf
from tensorflow.keras.preprocessing.image import img_to_array

def preprocess_image(image_bytes):
    """
    Preprocess image for MobileNetV2
    """
    try:

        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode in ('RGBA', 'LA'):
        
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'RGBA':
                background.paste(image, mask=image.split()[-1]) 
            else:
                background.paste(image, mask=image.split()[-1]) 
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        
        image = ImageOps.exif_transpose(image)
        image = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        image_array = img_to_array(image)
        image_array = tf.keras.applications.mobilenet_v2.preprocess_input(image_array)
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def validate_image(image_bytes):
    """
    Validate that the uploaded file is a valid image
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        return True
    except Exception:
        return False


CLASS_NAMES = [
    'apple', 'banana', 'beetroot', 'bell pepper', 'cabbage', 'capsicum', 'carrot',
    'cauliflower', 'chilli pepper', 'corn', 'cucumber', 'eggplant', 'garlic', 'ginger',
    'grapes', 'jalepeno', 'kiwi', 'lemon', 'lettuce', 'mango', 'onion', 'orange',
    'paprika', 'pear', 'peas', 'pineapple', 'pomegranate', 'potato', 'raddish', 'soy beans',
    'spinach', 'sweetcorn', 'sweetpotato', 'tomato', 'turnip', 'watermelon'
]


CLASS_ALIASES = {
    'bell pepper': ['bell_pepper', 'bellpepper', 'sweet pepper'],
    'chilli pepper': ['chili', 'chili pepper', 'hot pepper'],
    'jalepeno': ['jalapeño', 'jalapeño pepper'],
    'raddish': ['radish'],
    'soy beans': ['soybean', 'soybeans', 'soy_beans'],
    'sweetcorn': ['sweet corn', 'sweet_corn'],
    'sweetpotato': ['sweet potato', 'sweet_potato']
}

def get_class_info():
    """
    Get information about available classes
    """
    return {
        'classes': CLASS_NAMES,
        'total_classes': len(CLASS_NAMES),
        'aliases': CLASS_ALIASES
    }