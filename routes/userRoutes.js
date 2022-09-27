const express = require('express');

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
  
  const Router = express.Router();
  
  
  
  
  Router
    .route('/')
    .get(getAllusers)
    .post(createUser);
  
  Router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = Router;