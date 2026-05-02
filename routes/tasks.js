const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { createTaskValidator } = require('../validators/taskValidator');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('admin'), createTaskValidator, createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, authorize('admin'), deleteTask);

router.patch('/:id/assign', protect, authorize('admin'), assignTask);

module.exports = router;
