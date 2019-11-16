const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookiePaser = require('cookie-parser');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./utils/database');
const errorHandler = require('./middleware/error');

const indexRouter = require('./routes/index');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Cookie parser
app.use(cookiePaser());

// Prevent HTTP parameter pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/', indexRouter);

// Error handler
app.use(errorHandler);

module.exports = app;
