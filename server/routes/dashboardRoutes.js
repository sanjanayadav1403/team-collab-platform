const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getStatusCounts,
  getProjectCompletionHandler,
  getLeaderboard,
  getOverdueTasksHandler,
  getRecentActivityHandler,
} = require('../controllers/DashboardController');
const authenticate = require('../middleware/authenticate');

/**
 * Dashboard Routes — mounted at /api/dashboard
 *
 * GET /api/dashboard                      → full dashboard data
 * GET /api/dashboard/status-counts        → task counts by status
 * GET /api/dashboard/project-completion   → project progress
 * GET /api/dashboard/leaderboard          → team leaderboard
 * GET /api/dashboard/overdue              → overdue tasks
 * GET /api/dashboard/recent-activity      → recent activity
 */

router.get('/', authenticate, getDashboard);
router.get('/status-counts', authenticate, getStatusCounts);
router.get('/project-completion', authenticate, getProjectCompletionHandler);
router.get('/leaderboard', authenticate, getLeaderboard);
router.get('/overdue', authenticate, getOverdueTasksHandler);
router.get('/recent-activity', authenticate, getRecentActivityHandler);

module.exports = router;