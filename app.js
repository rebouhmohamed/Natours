const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const { json } = require('express');
const app = express();

// 1) MIDLLEWARES

app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  console.log('hello from the midlleware');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

// 2) ROUTE HANDLERS

const getAlltours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'succes',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'succes',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newtour = Object.assign({ id: newID }, req.body);
  tours.push(newtour);

  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'succes',
        data: {
          tour: newtour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  res.status(200).json({
    status: 'succes',
    data: {
      tour: '<updated tour here....>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  res.status(204).json({
    status: 'succes',
    data: null,
  });
};

const getAllusers = (req, res) => {
  res.status(500).
    json({
      status: 'error',
      message: 'this route is not difined',
    });
};

const getUser = (req, res) => {
  res.status(500).
    json({
      status: 'error',
      message: 'this route is not difined',
    });
};

const createUser = (req, res) => {
  res.status(500).
    json({
      status: 'error',
      message: 'this route is not difined',
    });
};

const updateUser = (req, res) => {
  res.status(500).
    json({
      status: 'error',
      message: 'this route is not difined',
    });
};

const deleteUser = (req, res) => {
  res.status(500).
    json({
      status: 'error',
      message: 'this route is not difined',
    });
};

// 3) ROUTES
const tourRouter = express.Router();
const userRouter = express.Router();
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

tourRouter
  .route('/')
  .get(getAlltours)
  .post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
  .route('/')
  .get(getAllusers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);



// 4) START SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
