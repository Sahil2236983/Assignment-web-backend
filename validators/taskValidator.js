const { body } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('project')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),

  body('status')
    .optional()
    .isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value'),

  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Invalid user ID for assignedTo'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date'),
];

const updateStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status value'),
];

module.exports = { createTaskValidator, updateStatusValidator };
