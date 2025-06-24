# Fruit Classifier API

A full-stack project for fruit image classification using a deep learning model served by Flask (Python) and an API Gateway built with Express.js (Node.js).

---

## Project Structure

```
Fruit-Classifier-API/
├── api-gateway/         # Node.js Express API Gateway
│   ├── app.js
│   ├── package.json
│   └── .env            # API Gateway environment variables (not committed)
├── model-service/      # Python Flask Model Service
│   ├── app.py
│   ├── requirements.txt
│   ├── utils.py
│   └── model.h5        # Trained model weights (not committed)
└── README.md           # This file
```

---

## Features
- **Image classification**: Upload an image and get top-3 fruit predictions.
- **API Gateway**: Handles requests, rate limiting, and security.
- **Model Service**: Loads a Keras model and serves predictions via REST API.
- **CORS & Security**: CORS enabled, HTTP headers secured, and rate limiting applied.

---

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/yourusername/Fruit-Classifier-API.git
```
```sh
cd Fruit-Classifier-API
```

### 2. Setup the Model Service (Python)
```sh
cd model-service
```
```sh
python3 -m venv venv
```
```sh
source venv/bin/activate
```
```sh
pip install -r requirements.txt
```

#### Add the model weights
- Download or generate `model.h5` and place it in the `model-service/` directory.
- **Note:** `model.h5` is not included in the repository. It must be provided separately.

#### (Optional) Set environment variables
- By default, the service looks for `model.h5` and runs on port 5000.
- A `.env` file can be created to override defaults:
  ```env
  MODEL_PATH=model.h5
  PORT=5000
  DEBUG=False
  ```

#### Start the model service
```sh
python app.py
```

### 3. Setup the API Gateway (Node.js)
```sh
cd ../api-gateway
npm install
```

#### Configure environment variables
- Create a `.env` file in `api-gateway/`:
  ```env
  MODEL_SERVICE_URL=http://localhost:5000
  PORT=3000
  RATE_LIMIT=100
  ```

#### Start the API Gateway
```sh
node app.js
# or
npm run dev
```

---

## API Usage

### Health Check
- **GET** `/health`
- Returns status of both API Gateway and Model Service.

### Classification
- **POST** `/classify`
- Form-data body with key `image` (type: file)
- Returns top-5 predicted classes and confidence scores.

#### Example using curl
```sh
curl -X POST http://localhost:3000/classify \
  -F image=@/path/to/fruit.jpg
```

---

## Notes
- `.env` and `model.h5` are excluded from version control for security and size reasons.
- If a sample `model.h5` is needed, train a model or contact the maintainer.
- Both services must be running before making requests.

---

## Troubleshooting
- **ModuleNotFoundError**: Ensure the virtual environment is activated and dependencies are installed.
- **OSError: No file or directory found at model.h5**: Place the trained model in `model-service/`.
- **MulterError: Unexpected field**: Use the field name `image` when uploading files.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss proposed changes.