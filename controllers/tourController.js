const { fail } = require('assert');
const fs = require('fs');
const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

exports.checkID = (req, res, next, val) => {
  console.log(`tour id is : ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({
      status: 'fail',
      message: 'missing name',
    });
  } else if (!req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'missing price',
    });
  }
  next();
};

exports.getAlltours = (req, res) => {
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

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    status: 'succes',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'succes',
    data: {
      tour: '<updated tour here....>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'succes',
    data: null,
  });
};
