const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // For members, scope to their projects
    let projectFilter = {};
    let taskFilter = {};

    if (!isAdmin) {
      const userProjects = await Project.find({ members: userId }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { project: { $in: projectIds } };
    }

    // Parallel queries for performance
    const [
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
      myTasks,
      recentTasks,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),

      Task.aggregate([
        { $match: taskFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: new Date() },
        status: { $ne: 'Done' },
      }),

      Task.countDocuments({ assignedTo: userId }),

      Task.find({ ...taskFilter, assignedTo: userId })
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status priority dueDate project'),
    ]);

    // Shape tasksByStatus into a flat object
    const statusMap = { 'To Do': 0, 'In Progress': 0, Done: 0 };
    tasksByStatus.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });

    // Admin-only extras
    let adminExtras = {};
    if (isAdmin) {
      const [totalUsers, tasksByPriority] = await Promise.all([
        User.countDocuments(),
        Task.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
      ]);

      const priorityMap = { Low: 0, Medium: 0, High: 0 };
      tasksByPriority.forEach(({ _id, count }) => {
        priorityMap[_id] = count;
      });

      adminExtras = { totalUsers, tasksByPriority: priorityMap };
    }

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus: statusMap,
        overdueTasks,
        myTasks,
        recentTasks,
        ...adminExtras,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
