const {
  getProjects,
  getProjectTasks,
  formatTask,
} = require('./openProjectService');

/**
 * Fetch tasks for all projects in parallel.
 * Returns flat array of all formatted tasks.
 */
const getAllTasks = async () => {
  const projects = await getProjects();
  const allTasks = [];

  await Promise.all(
    projects.map(async (project) => {
      try {
        const tasks = await getProjectTasks(project.id);
        allTasks.push(...tasks.map(formatTask));
      } catch (err) {
        console.warn(`Skipping project ${project.id}:`, err.message);
      }
    })
  );

  return allTasks;
};

const CLOSED_STATUSES = ['Closed', 'Resolved', 'Done', 'Finished'];
const IN_PROGRESS_STATUSES = ['In progress', 'In Progress'];

/**
 * Task counts grouped by status.
 * Returns: { statusCounts: { 'New': 5, ... }, total: 20 }
 */
const getTaskStatusCounts = async () => {
  const allTasks = await getAllTasks();

  const statusCounts = allTasks.reduce((acc, task) => {
    const status = task.status.name;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return { statusCounts, total: allTasks.length };
};

/**
 * Project-wise completion percentage.
 * Returns: [{ id, name, total, done, inProgress, percentage }]
 */
const getProjectCompletion = async () => {
  const projects = await getProjects();

  const stats = await Promise.all(
    projects.map(async (project) => {
      try {
        const tasks = await getProjectTasks(project.id);
        const formatted = tasks.map(formatTask);
        const total = formatted.length;
        const done = formatted.filter((t) => CLOSED_STATUSES.includes(t.status.name)).length;
        const inProgress = formatted.filter((t) => IN_PROGRESS_STATUSES.includes(t.status.name)).length;

        return {
          id: project.id,
          name: project.name,
          total,
          done,
          inProgress,
          percentage: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      } catch {
        return null;
      }
    })
  );

  return stats.filter((p) => p && p.total > 0);
};

/**
 * Team leaderboard — tasks completed per member.
 * Returns: [{ name, tasksCompleted, tasksInProgress, tasksNew, total }]
 */
const getTeamLeaderboard = async () => {
  const allTasks = await getAllTasks();

  const memberStats = allTasks.reduce((acc, task) => {
    if (!task.assignee) return acc;
    const name = task.assignee.name;

    if (!acc[name]) {
      acc[name] = { name, tasksCompleted: 0, tasksInProgress: 0, tasksNew: 0, total: 0 };
    }

    acc[name].total += 1;
    const status = task.status.name;

    if (CLOSED_STATUSES.includes(status)) acc[name].tasksCompleted += 1;
    else if (IN_PROGRESS_STATUSES.includes(status)) acc[name].tasksInProgress += 1;
    else acc[name].tasksNew += 1;

    return acc;
  }, {});

  return Object.values(memberStats)
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, 10);
};

/**
 * Overdue tasks — dueDate < today and not closed.
 */
const getOverdueTasks = async () => {
  const allTasks = await getAllTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return allTasks
    .filter((task) => {
      if (!task.dueDate) return false;
      if (CLOSED_STATUSES.includes(task.status.name)) return false;
      return new Date(task.dueDate) < today;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

/**
 * Recent activity — last 20 updated tasks.
 */
const getRecentActivity = async () => {
  const allTasks = await getAllTasks();

  return allTasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 20)
    .map((task) => ({
      id: task.id,
      subject: task.subject,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      project: task.project,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate,
    }));
};

/**
 * Full dashboard data in one call — runs all queries in parallel.
 */
const getDashboardData = async () => {
  const [
    { statusCounts, total },
    projectCompletion,
    leaderboard,
    overdueTasks,
    recentActivity,
  ] = await Promise.all([
    getTaskStatusCounts(),
    getProjectCompletion(),
    getTeamLeaderboard(),
    getOverdueTasks(),
    getRecentActivity(),
  ]);

  return {
    statusCounts,
    total,
    projectCompletion,
    leaderboard,
    overdueTasks,
    recentActivity,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  getDashboardData,
  getTaskStatusCounts,
  getProjectCompletion,
  getTeamLeaderboard,
  getOverdueTasks,
  getRecentActivity,
};