const express = require('express');
const router = express.Router();
const {
  fetchProjects,
  fetchProjectById,
  fetchProjectTasks,
  fetchTaskById,
  fetchProjectMembers,
  fetchMyTasks,
  fetchStatuses,
} = require('../controllers/openProjectController');
const authenticate = require('../middleware/authenticate');


router.get('/projects', authenticate, fetchProjects);
router.get('/projects/:projectId', authenticate, fetchProjectById);
router.get('/projects/:projectId/tasks', authenticate, fetchProjectTasks);
router.get('/projects/:projectId/members', authenticate, fetchProjectMembers);
router.get('/tasks/:taskId', authenticate, fetchTaskById);
router.get('/my-tasks', authenticate, fetchMyTasks);
router.get('/statuses', authenticate, fetchStatuses);

module.exports = router;