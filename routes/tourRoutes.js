/* eslint-disable prettier/prettier */
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const Router = express.Router();

//Router.param('id', tourController.checkID);
Router.route('/top-5-cheap').get(
  tourController.aliasTopTours,
  tourController.getAlltours
);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
Router.route('/')
  .get(authController.protect, tourController.getAlltours)
  .post(tourController.createTour);

Router.route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour
  );

module.exports = Router;
