const express = require('express');
const morgan = require('morgan');
const AppEroor = require('./Utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static('./public'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// 2) ROUTE HANDLERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
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
