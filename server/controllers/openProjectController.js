const {
  getProjects,
  getProjectById,
  getProjectTasks,
  getTaskById,
  getProjectMembers,
  getMyTasks,
  getStatuses,
  formatTask,
} = require('../services/openProjectService');
const { createError } = require('../middleware/errorHandler');

/**
 * GET /api/openproject/projects
 * Fetch all projects from OpenProject
 */
const fetchProjects = async (req, res, next) => {
  try {
    const projects = await getProjects();

    const formatted = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description?.raw || '',
      status: p.status,
      createdAt: p.createdAt,
      identifier: p.identifier,
    }));

    return res.status(200).json({
      success: true,
      data: { projects: formatted },
    });
  } catch (err) {
    console.error('OpenProject fetchProjects error:', err.message);
    if (err.response?.status === 401) {
      return next(createError(401, 'OpenProject API token is invalid or expired.'));
    }
    next(err);
  }
};

/**
 * GET /api/openproject/projects/:projectId
 * Fetch a single project detail
 */
const fetchProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await getProjectById(projectId);

    return res.status(200).json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description?.raw || '',
          status: project.status,
          identifier: project.identifier,
        },
      },
    });
  } catch (err) {
    console.error('OpenProject fetchProjectById error:', err.message);
    if (err.response?.status === 404) {
      return next(createError(404, 'Project not found in OpenProject.'));
    }
    next(err);
  }
};

/**
 * GET /api/openproject/projects/:projectId/tasks
 * Fetch all work packages for a project
 * Optional query: ?status=open|closed|all
 */
const fetchProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let filters = [];

    // Filter by status if provided
    if (status === 'open') {
      filters.push({ status: { operator: 'o', values: [] } }); // open statuses
    } else if (status === 'closed') {
      filters.push({ status: { operator: 'c', values: [] } }); // closed statuses
    }

    const tasks = await getProjectTasks(projectId, filters);
    const formatted = tasks.map(formatTask);

    // Group tasks by status for kanban board
    const grouped = formatted.reduce((acc, task) => {
      const statusName = task.status.name;
      if (!acc[statusName]) acc[statusName] = [];
      acc[statusName].push(task);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        tasks: formatted,
        grouped,
        total: formatted.length,
      },
    });
  } catch (err) {
    console.error('OpenProject fetchProjectTasks error:', err.message);
    next(err);
  }
};

/**
 * GET /api/openproject/tasks/:taskId
 * Fetch a single task detail
 */
const fetchTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await getTaskById(taskId);

    return res.status(200).json({
      success: true,
      data: { task: formatTask(task) },
    });
  } catch (err) {
    console.error('OpenProject fetchTaskById error:', err.message);
    if (err.response?.status === 404) {
      return next(createError(404, 'Task not found in OpenProject.'));
    }
    next(err);
  }
};

/**
 * GET /api/openproject/projects/:projectId/members
 * Fetch all members of a project
 */
const fetchProjectMembers = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const members = await getProjectMembers(projectId);

    const formatted = members.map((m) => ({
      id: m.id,
      name: m._links?.principal?.title || 'Unknown',
      href: m._links?.principal?.href,
      roles: m._links?.roles?.map((r) => r.title) || [],
    }));

    return res.status(200).json({
      success: true,
      data: { members: formatted },
    });
  } catch (err) {
    console.error('OpenProject fetchProjectMembers error:', err.message);
    next(err);
  }
};

/**
 * GET /api/openproject/my-tasks
 * Fetch tasks assigned to the API token user
 */
const fetchMyTasks = async (req, res, next) => {
  try {
    const tasks = await getMyTasks();
    const formatted = tasks.map(formatTask);

    return res.status(200).json({
      success: true,
      data: {
        tasks: formatted,
        total: formatted.length,
      },
    });
  } catch (err) {
    console.error('OpenProject fetchMyTasks error:', err.message);
    next(err);
  }
};

/**
 * GET /api/openproject/statuses
 * Fetch all available task statuses
 */
const fetchStatuses = async (req, res, next) => {
  try {
    const statuses = await getStatuses();

    const formatted = statuses.map((s) => ({
      id: s.id,
      name: s.name,
      isClosed: s.isClosed,
      color: s.color || '#94a3b8',
    }));

    return res.status(200).json({
      success: true,
      data: { statuses: formatted },
    });
  } catch (err) {
    console.error('OpenProject fetchStatuses error:', err.message);
    next(err);
  }
};

module.exports = {
  fetchProjects,
  fetchProjectById,
  fetchProjectTasks,
  fetchTaskById,
  fetchProjectMembers,
  fetchMyTasks,
  fetchStatuses,
};