import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useTaskStore from '../store/taskStore';
import useOrgStore from '../store/orgStore';
import ProjectList from '../components/tasks/ProjectList';
import TaskBoard from '../components/tasks/TaskBoard';
import { ChevronsLeft, File } from 'lucide-react';

/**
 * TasksPage
 * Main tasks page — shows OpenProject projects on left,
 * kanban board of tasks on right.
 */
const TasksPage = () => {
    const navigate = useNavigate();
    const { currentOrg } = useOrgStore();
    const {
        projects,
        selectedProject,
        groupedTasks,
        loading,
        error,
        setProjects,
        setSelectedProject,
        setTasks,
        setLoading,
        setError,
    } = useTaskStore();

    const [projectsLoading, setProjectsLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [myTasks, setMyTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('board');
    const [myTasksLoading, setMyTasksLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    //Fetch all projects on mount
    useEffect(() => {
        setProjectsLoading(true);
        api.get('/openproject/projects')
            .then((res) => setProjects(res.data.data.projects))
            .catch((err) => setError(err.response?.data?.message || 'Failed to load projects'))
            .finally(() => setProjectsLoading(false));
    }, []);

    // Fetch tasks when project is selected
    useEffect(() => {
        if (!selectedProject) return;

        setTasksLoading(true);
        api.get(`/openproject/projects/${selectedProject.id}/tasks`)
            .then((res) => {
                const { tasks, grouped } = res.data.data;
                setTasks(tasks, grouped);
            })
            .catch((err) => setError(err.response?.data?.message || 'Failed to load tasks'))
            .finally(() => setTasksLoading(false));
    }, [selectedProject?.id]);

    // Fetch my tasks
    const handleMyTasksTab = () => {
        setActiveTab('my-tasks');
        if (myTasks.length > 0) return;

        setMyTasksLoading(true);
        api.get('/openproject/my-tasks')
            .then((res) => setMyTasks(res.data.data.tasks))
            .catch((err) => setError(err.response?.data?.message || 'Failed to load my tasks'))
            .finally(() => setMyTasksLoading(false));
    };

    // Filter tasks by search query
    const filterTasks = (grouped) => {
        if (!searchQuery.trim()) return grouped;

        const filtered = {};
        Object.entries(grouped).forEach(([status, tasks]) => {
            const matching = tasks.filter((t) =>
                t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (matching.length > 0) filtered[status] = matching;
        });
        return filtered;
    };

    // Group my tasks by status for board view
    const groupMyTasks = () => {
        return myTasks.reduce((acc, task) => {
            const status = task.status.name;
            if (!acc[status]) acc[status] = [];
            acc[status].push(task);
            return acc;
        }, {});
    };

    const displayGrouped = activeTab === 'my-tasks'
        ? filterTasks(groupMyTasks())
        : filterTasks(groupedTasks);

    const totalTasks = activeTab === 'my-tasks'
        ? myTasks.length
        : Object.values(groupedTasks).flat().length;

    return (
        <div className="h-screen flex flex-col bg-gray-200 overflow-hidden">

            {/* Top navbar */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-300 hover:bg-gray-800 px-2.5 py-1.5 rounded-lg transition"
                    >
                        <ChevronsLeft />
                        Dashboard
                    </button>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-gray-500 font-semibold text-sm">Tasks</h1>
                    {selectedProject && (
                        <>
                            <span className="text-gray-700">/</span>
                            <span className="text-indigo-400 text-sm">{selectedProject.name}</span>
                        </>
                    )}
                </div>

                {/* OpenProject badge */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Connected to OpenProject
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* Left sidebar — Projects */}
                <aside className="w-56 border-r border-gray-200 shrink-0 bg-gray-300">
                    <ProjectList
                        projects={projects}
                        selectedProject={selectedProject}
                        onSelect={setSelectedProject}
                        loading={projectsLoading}
                    />
                </aside>

                {/* Main content */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between shrink-0">
                        {/* Tabs */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveTab('board')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'board'
                                    ? 'bg-indigo-600/20 text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                Board
                            </button>
                            <button
                                onClick={handleMyTasksTab}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'my-tasks'
                                    ? 'bg-indigo-600/20 text-indigo-400'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                My Tasks
                            </button>
                        </div>


                    </div>

                    {/* Error state */}
                    {error && (
                        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Board area */}
                    <div className="flex-1 overflow-auto p-4">
                        {activeTab === 'board' && !selectedProject ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-300 flex items-center justify-center mx-auto mb-4">
                                        <File />
                                    </div>
                                    <p className="text-gray-500 font-medium">Select a project</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Choose a project from the left to view its tasks
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <TaskBoard
                                groupedTasks={displayGrouped}
                                loading={activeTab === 'board' ? tasksLoading : myTasksLoading}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TasksPage;