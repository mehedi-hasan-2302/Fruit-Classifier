require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100,
  message: 'Too many requests, please try again later'
});
app.use(limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.MODEL_SERVICE_URL}/health`);
    res.json({
      api: 'healthy',
      model_service: response.data
    });
  } catch (error) {
    res.status(500).json({
      api: 'healthy',
      model_service: 'unreachable',
      error: error.message
    });
  }
});

// Classification endpoint
app.post('/classify', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      `${process.env.MODEL_SERVICE_URL}/predict`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Content-Length': form.getLengthSync()
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Model service error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Classification failed',
      details: error.response?.data || error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Model service: ${process.env.MODEL_SERVICE_URL}`);
});