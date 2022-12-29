const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchasync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const sendEmail = require('../Utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'succes',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchasync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createAndSendToken(newUser, 201, res);
});
exports.login = catchasync(async (req, res, next) => {
  const { email, password } = req.body;

  //1-check if email and password exist ?
  if (!email || !password) {
    return next(new AppError('please provide email and password ', 400));
  }
  //2-check if the user exist adn password correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect password or email ', 401));
  }
  //3- if everything okay then send the token to the clieant
  createAndSendToken(user, 200, res);
});
exports.protect = catchasync(async (req, res, next) => {
  //1- getting and check the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('please log in and try again', 401));
  }
  //2-verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3- check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('this user does not exist anymore', 401));
  }

  //4-check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password,please login again !', 401)
    );
  }
  req.user = freshUser;
  next();
});
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('you dont have permession to do that ', 403));
    }
    next();
  };
};
exports.forgotPassword = catchasync(async (req, res, next) => {
  //1 Get user bassed on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this eamil', 404));
  }

  //2 generate the random reset token
  const resetToken = user.correctPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3 send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot password ? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nif you didnt forget your password,please ignore this email !`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token(valid for 10mn )',
      message,
    });
    res.status(200).json({
      status: 'succes',
      message: 'token sent to eamil',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending the email. try again later', 500)
    );
  }
});

exports.resetPassword = catchasync(async (req, res, next) => {
  // 1 get user based on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashToken);
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2 if the token has not expired,and there is a user ,then set the new password
  if (!user) {
    return next(new AppError('token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  try {
    await user.save();
  } catch (err) {
    console.log(err);
  }
  //3 update changedPasswordAt property for the user
  //4 log the user in ,send token
  createAndSendToken(user, 200, res);
});
exports.updatePassword = catchasync(async (req, res, next) => {
  //1) get the user from db

  const user = await User.findById(req.user.id).select('+password');

  //2) check password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your corrent password is wrong ', 401));
  }

  //3) update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) log in user,send jwt
  createAndSendToken(user, 200, res);
});
