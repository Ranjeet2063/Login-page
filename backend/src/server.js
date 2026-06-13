require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const csurf = require('csurf');
const { apiLimiter, helmet, xssClean, mongoSanitize, hpp } = require('./middleware/security');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(xssClean());
app.use(mongoSanitize());
app.use(hpp());
app.use(apiLimiter);

app.use('/api', routes);
app.use('/api/csrf-token', csurf({ cookie: true }), (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use((err, _, res, __) => {
  if (err.code === 'EBADCSRFTOKEN') return res.status(403).json({ message: 'Invalid CSRF token' });
  return res.status(500).json({ message: err.message || 'Server error' });
});

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`API running on :${port}`);
  });
}).catch((error) => {
  console.error('Database connection failed', error.message);
  process.exit(1);
});
