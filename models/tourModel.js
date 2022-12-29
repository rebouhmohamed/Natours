const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'name must be less or equel to 40 charachter'],
      minlength: [10, 'name must be more or equel to 40 charachter'],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'rating can not be more than 5'],
      min: [1, 'rating can not be less than 1'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price '],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to the current doc on new document creation
          return val < this.price;
        },
        message: 'the discount price can not be more than the price ',
      },
    },
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
    secrettour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourschema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourschema.virtual('durationHours').get(function () {
  return this.duration * 24;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() bot not .insertMAny()
tourschema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourschema.pre('save', function (next) {
//   console.log('will save document...');
//   next();
// });
// tourschema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
tourschema.pre(/^find/, function (next) {
  this.find({ secrettour: { $ne: true } });

  this.start = Date.now();
  next();
});
tourschema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start}ms`);
  next();
});
tourschema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secrettour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('tour', tourschema);
module.exports = Tour;
