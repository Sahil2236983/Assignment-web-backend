const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, project, status, priority, assignedTo, dueDate } = req.body;

    // Verify project exists and user has access
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // If assigning to a user, verify they are a project member
    if (assignedTo) {
      const isMember = proj.members.some((m) => m.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Assigned user is not a project member' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      status,
      priority,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filters and pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { project, status, assignedTo, priority, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Members can only see tasks in their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      filter.project = { $in: userProjects.map((p) => p._id) };
    }

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name members');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only view tasks from their projects
    if (req.user.role !== 'admin') {
      const isMember = task.project.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task (admin full update, member status only)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role !== 'admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update tasks assigned to you' });
      }
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }
      task.status = status;
    } else {
      // Admin can update everything
      const { title, description, status, priority, assignedTo, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign task to a user
// @route   PATCH /api/tasks/:id/assign
// @access  Private/Admin
const assignTask = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify the user is a project member before assigning
    const isMember = task.project.members.some((m) => m.toString() === userId);
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'User is not a member of this project' });
    }

    task.assignedTo = userId;
    await task.save();
    await task.populate('assignedTo', 'name email');

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, assignTask };
