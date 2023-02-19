const Review = require('../models/reviewModel');
const factory = require('./HandlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReveiws = factory.GetAll(Review);
exports.createReview = factory.CreateOne(Review);
exports.deleteReview = factory.DeleteOne(Review);
exports.updateReview = factory.UpdateOne(Review);
exports.getReview = factory.GetOne(Review);
