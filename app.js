const express = require('express');
const morgan = require('morgan');
const AppEroor = require('./Utils/appError');
const errorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// set security http headers
app.use(helmet());

//development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit api request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP plz try again within an hour ',
});

app.use('/api', limiter);

// body parser , reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

//data sanitization against noSQL querry injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameters pullotion
app.use(
  hpp({
    whitelist: [
      'ratingsAverage',
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// serving static files
app.use(express.static('./public'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// 2) ROUTE HANDLERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server `,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server `);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppEroor(`Can't find ${req.originalUrl} on this server `, 404));
});
app.use(errorHandler);

module.exports = app;
