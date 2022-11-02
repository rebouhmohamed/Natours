const mongoose = require('mongoose');

const tourschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration '],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'a tour must have a max group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'a tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price '],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'a tour must have a description'],
  },
  imageCover: {
    type: String,
    required: [true, 'a tour must have a imageCover'],
  },
  image: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

const Tour = mongoose.model('tour', tourschema);
module.exports = Tour;
