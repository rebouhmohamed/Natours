const Tour = require('../models/tourModel');
const APIFeatures = require('../Utils/apiFeatures');
const catchasync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAlltours = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .limitfields()
    .sort()
    .paginate();
  const tours = await features.query;

  //SEND RESPONCES
  res.status(200).json({
    status: 'succes',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchasync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id: req.params.id})
  if (!tour) {
    return next(new AppError('no tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'succes',
    data: {
      tour,
    },
  });
});

exports.createTour = catchasync(async (req, res, next) => {
  const newtour = await Tour.create(req.body);

  res.status(201).json({
    status: 'succes',
    data: {
      tour: newtour,
    },
  });
});

exports.updateTour = catchasync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('no tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'succes',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchasync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('no tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'succes',
    data: null,
  });
});
exports.getTourStats = catchasync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'succes',
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchasync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numToursStart: -1,
        month: 1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'succes',
    data: {
      plan,
    },
  });
});
