const { body, param } = require('express-validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const memberValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID'),
];

module.exports = { createProjectValidator, memberValidator };
