# Fruit Classifier API

A full-stack project for fruit image classification using a deep learning model served by Flask (Python), an API Gateway built with Express.js (Node.js), and a modern Next.js frontend.

---

## Project Structure

```
Fruit-Classifier-API/
├── backend/
│   ├── api-gateway/         # Node.js Express API Gateway
│   │   ├── app.js
│   │   ├── package.json
│   │   └── .env            # API Gateway environment variables (not committed)
│   └── model-service/      # Python Flask Model Service
│       ├── app.py
│       ├── requirements.txt
│       ├── utils.py
│       └── model.h5        # Trained model weights (not committed)
├── frontend/               # Next.js React Frontend
│   ├── src/app/page.tsx
│   ├── package.json
│   └── ...
└── README.md               # This file
```

---

## Features
- **Image classification**: Images can be uploaded to receive top-3 fruit predictions.
- **Professional UI**: A beautiful, responsive Next.js frontend provides live preview and clear results.
- **API Gateway**: Requests, rate limiting, and security are managed by the gateway.
- **Model Service**: A Keras model is loaded and predictions are served via REST API.
- **CORS & Security**: CORS is enabled, HTTP headers are secured, and rate limiting is applied.
- **Smart Result**: The most likely fruit is clearly displayed, or a tie is shown if confidences are equal.

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
cd backend/model-service
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
- The file `model.h5` should be downloaded or generated and placed in the `backend/model-service/` directory.
- **Note:** `model.h5` is not included in the repository and must be provided separately.

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
```
```sh
npm install
```
- A `.env` file should be created in `backend/api-gateway/`:
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

### 4. Setup the Frontend (Next.js)
```sh
cd ../../../frontend
```
```sh
npm install
```
- The frontend expects the API Gateway to be running at `http://localhost:3000` by default.
- To change the API URL, the fetch URL in `src/app/page.tsx` should be updated.

#### Start the frontend
```sh
npm run dev
```
- The app can be accessed at [http://localhost:3001](http://localhost:3001) (or the port shown in the terminal).

---

## Frontend Features
- Fruit images can be uploaded and previewed instantly.
- A clear classification result is shown: either the most likely fruit or a tie if confidences are equal.
- Top predictions are displayed with confidence bars.
- API status is indicated and helpful usage instructions are provided.
- The design is beautiful and responsive, styled with Tailwind CSS.

---

## API Usage

### Health Check
- **GET** `/health` (API Gateway)
- The status of both API Gateway and Model Service is returned.

### Classification
- **POST** `/classify` (API Gateway)
- The form-data body should have the key `image` (type: file).
- The top predicted classes and confidence scores are returned.

#### Example using curl
```sh
curl -X POST http://localhost:3000/classify \
  -F image=@/path/to/fruit.jpg
```

---

## Notes
- `.env` and `model.h5` are excluded from version control for security and size reasons.
- If a sample `model.h5` is needed, a model should be trained or the maintainer should be contacted.
- All three services (model, gateway, frontend) must be running before requests are made from the UI.

---

## Troubleshooting
- **ModuleNotFoundError**: The virtual environment should be activated and dependencies installed.
- **OSError: No file or directory found at model.h5**: The trained model should be placed in `backend/model-service/`.
- **MulterError: Unexpected field**: The field name `image` should be used when uploading files.
- **API not reachable**: Both backend services should be running and CORS should be enabled.

---

## Contributing
Pull requests are welcome. For major changes, an issue should be opened first to discuss proposed changes.