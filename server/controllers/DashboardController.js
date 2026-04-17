const {
  getDashboardData,
  getTaskStatusCounts,
  getProjectCompletion,
  getTeamLeaderboard,
  getOverdueTasks,
  getRecentActivity,
} = require('../services/dashboardService');

/**
 * GET /api/dashboard
 * Full dashboard data in one call.
 * Frontend calls this on page load.
 */
const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardData();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getDashboard error:', err.message);
    next(err);
  }
};

/**
 * GET /api/dashboard/status-counts
 * Task counts by status — used for pie/bar chart.
 */
const getStatusCounts = async (req, res, next) => {
  try {
    const data = await getTaskStatusCounts();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/project-completion
 * Project completion percentages — used for progress bars.
 */
const getProjectCompletionHandler = async (req, res, next) => {
  try {
    const projects = await getProjectCompletion();
    return res.status(200).json({ success: true, data: { projects } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/leaderboard
 * Team activity leaderboard.
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await getTeamLeaderboard();
    return res.status(200).json({ success: true, data: { leaderboard } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/overdue
 * Overdue tasks list.
 */
const getOverdueTasksHandler = async (req, res, next) => {
  try {
    const tasks = await getOverdueTasks();
    return res.status(200).json({ success: true, data: { tasks } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/recent-activity
 * Recent activity feed.
 */
const getRecentActivityHandler = async (req, res, next) => {
  try {
    const activity = await getRecentActivity();
    return res.status(200).json({ success: true, data: { activity } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getStatusCounts,
  getProjectCompletionHandler,
  getLeaderboard,
  getOverdueTasksHandler,
  getRecentActivityHandler,
};