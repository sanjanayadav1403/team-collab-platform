const axios = require('axios');

const OP_BASE_URL = process.env.OPENPROJECT_URL;
const OP_API_TOKEN = process.env.OPENPROJECT_API_TOKEN;

// Base axios instance for OpenProject API
const opClient = axios.create({
    baseURL: `${OP_BASE_URL}/api/v3`,
    headers: {
        'Authorization': `Basic ${Buffer.from(`apikey:${OP_API_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/json',
    },
});

//Get projects
const getProjects = async () => {
    const res = await opClient.get('/projects', {
        params: { pageSize: 50 },
    });
    return res.data._embedded?.elements || [];
};

// Get a single project by ID
const getProjectById = async (projectId) => {
    const res = await opClient.get(`/projects/${projectId}`);
    return res.data;
};

// Get all work packages (tasks) for a project
const getProjectTasks = async (projectId, filters = []) => {
    const defaultFilters = [
        { project: { operator: '=', values: [String(projectId)] } },
    ];
    const allFilters = [...defaultFilters, ...filters];

    const res = await opClient.get(`/projects/${projectId}/work_packages`, {
        params: {
            filters: JSON.stringify(allFilters),
            pageSize: 100,
            sortBy: JSON.stringify([['updatedAt', 'desc']]),
        },
    });

    return res.data._embedded?.elements || [];
};

// Get a single work package by ID
const getTaskById = async (taskId) => {
    const res = await opClient.get(`/work_packages/${taskId}`);
    return res.data;
};

// Get all members of a project
const getProjectMembers = async (projectId) => {
    const res = await opClient.get(`/projects/${projectId}/memberships`, {
        params: { pageSize: 50 },
    });
    return res.data._embedded?.elements || [];
};

// Get tasks assigned to a specific user (by OpenProject user ID)
//  Pass 'me' to get current API token user's tasks
const getMyTasks = async () => {
    const filters = [
        { assignee: { operator: '=', values: ['me'] } },
        { status: { operator: '!', values: ['14'] } },
    ];

    const res = await opClient.get('/work_packages', {
        params: {
            filters: JSON.stringify(filters),
            pageSize: 50,
            sortBy: JSON.stringify([['dueDate', 'asc']]),
        },
    });
    return res.data._embedded?.elements || [];
};

/**
 * Get all available statuses
 */
const getStatuses = async () => {
    const res = await opClient.get('/statuses');
    return res.data._embedded?.elements || [];
};

/**
 * Format a work package into a clean object for frontend
 */
const formatTask = (wp) => ({
    id: wp.id,
    subject: wp.subject,
    description: wp.description?.raw || '',
    status: {
        id: wp._links?.status?.href?.split('/').pop(),
        name: wp._links?.status?.title || 'Unknown',
    },
    priority: {
        name: wp._links?.priority?.title || 'Normal',
    },
    assignee: wp._links?.assignee?.title
        ? {
            name: wp._links.assignee.title,
            href: wp._links.assignee.href,
        }
        : null,
    project: {
        id: wp._links?.project?.href?.split('/').pop(),
        name: wp._links?.project?.title,
    },
    type: wp._links?.type?.title || 'Task',
    dueDate: wp.dueDate || null,
    startDate: wp.startDate || null,
    createdAt: wp.createdAt,
    updatedAt: wp.updatedAt,
    percentageDone: wp.percentageDone || 0,
});

module.exports = {
    getProjects,
    getProjectById,
    getProjectTasks,
    getTaskById,
    getProjectMembers,
    getMyTasks,
    getStatuses,
    formatTask,
};