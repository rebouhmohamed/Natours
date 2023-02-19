const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const APIFeatures = require('../Utils/apiFeatures');

exports.DeleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }
    res.status(204).json({
      status: 'succes',
      data: null,
    });
  });

exports.UpdateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }
    res.status(200).json({
      status: 'succes',
      data: {
        doc,
      },
    });
  });

exports.CreateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });
exports.GetOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // Tour.findOne({_id: req.params.id})
    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }
    res.status(200).json({
      status: 'succes',
      data: {
        data: doc,
      },
    });
  });
exports.GetAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitfields()
      .sort()
      .paginate();
    const doc = await features.query;

    //SEND RESPONCES
    res.status(200).json({
      status: 'succes',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
