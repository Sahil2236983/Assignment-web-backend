const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { createProjectValidator, memberValidator } = require('../validators/projectValidator');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), createProjectValidator, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.route('/:id/members')
  .post(protect, authorize('admin'), memberValidator, addMember);

router.route('/:id/members/:userId')
  .delete(protect, authorize('admin'), removeMember);

module.exports = router;
