import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import useOrgStore from '../store/orgStore';
import OrgSwitcher from '../components/org/OrgSwitcher';
import CreateOrgModal from '../components/org/CreateOrgModal';
import { Building2, RefreshCw, TriangleAlert } from 'lucide-react';
import OverdueTasks from '../components/dashboard/OverdueTasks';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import StatusChart from '../components/dashboard/StatusChart';
import RecentActivity from '../components/dashboard/RecentActivity';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout, setUser } = useAuthStore();
    const { orgs, currentOrg, setOrgs } = useOrgStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    // Analytics state
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [dashboardError, setDashboardError] = useState('');
    const [lastRefreshed, setLastRefreshed] = useState(null);

    useEffect(() => {
        if (!user) {
            api.get('/auth/me')
                .then((res) => setUser(res.data.data.user))
                .catch(() => logout());
        }
    }, []);

    const fetchOrgs = async () => {
        try {
            const res = await api.get('/orgs/me');
            setOrgs(res.data.data.orgs);
        } catch (err) {
            console.error('Failed to fetch orgs', err);
        } finally {
            setLoadingOrgs(false);
        }
    };

    useEffect(() => { fetchOrgs(); }, []);

    // Fetch Open project analytics
    const fetchDashboard = useCallback(async () => {
        setLoadingDashboard(true);
        setDashboardError('');
        try {
            const res = await api.get('/dashboard');
            setDashboardData(res.data.data);
            setLastRefreshed(new Date());
        } catch (err) {
            setDashboardError(
                err.response?.data?.message ||
                'Failed to load analytics. Check your OpenProject connection.'
            );
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !currentOrg) return;
        setInviteLoading(true);
        setInviteStatus('');
        try {
            await api.post(`/orgs/${currentOrg.id}/invite`, { email: inviteEmail });
            setInviteStatus('success');
            setInviteEmail('');
        } catch (err) {
            setInviteStatus(err.response?.data?.message || 'Failed to send invite.');
        } finally {
            setInviteLoading(false);
        }
    };

    const getInitials = (name) =>
        name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gray-200 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-gray-300 border-r border-gray-200 flex flex-col">

                <div className="p-3 border-b border-gray-200">
                    <OrgSwitcher onCreateNew={() => setShowCreateModal(true)} />
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider px-3 mb-2">
                        Workspace
                    </p>
                    {/* Updated nav items — added AI Assistant */}
                    {[
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: 'Channels', path: '/chat' },
                        { label: 'Tasks', path: '/tasks' },
                        { label: 'Files', path: '/files' },
                        { label: 'AI Assistant', path: '/ai' },
                    ].map(({ label, path }) => (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${window.location.pathname === path
                                ? 'bg-indigo-600/20 text-indigo-600 font-medium'
                                : 'text-gray-900 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-200">
                    <div className="flex items-center gap-2.5 px-2 py-1.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-600 truncate">{user?.name || 'Loading...'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout} title="Logout" className="text-gray-500 hover:text-red-400 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">

                <div className="h-14 border-b border-gray-400 flex items-center justify-between px-6">
                    <h1 className="text-gray-800 font-semibold">
                        {currentOrg ? currentOrg.name : 'Dashboard'}
                    </h1>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchDashboard}
                        disabled={loadingDashboard}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-300 rounded-lg transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingDashboard ? 'animate-spin' : ''}`} />
                        {loadingDashboard
                            ? 'Refreshing...'
                            : lastRefreshed
                                ? `Updated ${formatTime(lastRefreshed)}`
                                : 'Refresh'}
                    </button>
                </div>

                <div className="p-6 max-w-4xl">

                    {!loadingOrgs && orgs.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                <Building2 color='white' size={32} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-600 mb-2">No organisations yet</h2>
                            <p className="text-gray-500 mb-6 text-sm">Create one to get started with your team.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition"
                            >
                                Create Organisation
                            </button>
                        </div>
                    )}

                    {currentOrg && (
                        <div className="space-y-6">

                            <div className="bg-gray-200 border border-gray-400 rounded-2xl p-6">
                                <h2 className="text-lg font-semibold text-gray-600 mb-1">
                                    Welcome back, {user?.name?.split(' ')[0]}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    You're viewing <span className="text-gray-600 font-medium">{currentOrg.name}</span> as{' '}
                                    <span className="capitalize text-indigo-400">{currentOrg.role}</span>.
                                </p>
                            </div>

                            {/* Analytics Section */}
                            <div>
                                <div className='flex items-center justify-between mb-3'>
                                    <p className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                        Analytics . OpenProject
                                    </p>
                                    {dashboardData && (
                                        <span className="text-xs text-gray-500">
                                            {dashboardData.total} total tasks
                                        </span>
                                    )}
                                </div>

                                {/* Error */}
                                {dashboardError && (
                                    <div className='mb-4 p-3 rounded-xl bg-red-500/10 border border-red-200 text-red-500 text-sm'>
                                        <TriangleAlert /> {dashboardError}
                                    </div>
                                )}

                                {/* Loading skeleton */}
                                {loadingDashboard && !dashboardData && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="bg-gray-300 border border-gray-200 rounded-2xl p-5 animate-pulse">
                                                <div className="h-4 bg-gray-400 rounded w-1/3 mb-4" />
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((j) => (
                                                        <div key={j} className="h-3 bg-gray-400 rounded" />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Dashboard data */}
                                {dashboardData && (
                                    <>
                                        {/* Summary stat cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                            {[
                                                { label: 'Total Tasks', value: dashboardData.total, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
                                                {
                                                    label: 'Overdue',
                                                    value: dashboardData.overdueTasks.length,
                                                    color: dashboardData.overdueTasks.length > 0 ? 'text-red-500' : 'text-green-500',
                                                    bg: dashboardData.overdueTasks.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200',
                                                },
                                                { label: 'Projects', value: dashboardData.projectCompletion.length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                                                { label: 'Team Members', value: dashboardData.leaderboard.length, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
                                            ].map((stat) => (
                                                <div key={stat.label} className={`border rounded-xl p-4 ${stat.bg}`}>
                                                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Analytics widgets grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                                            <StatusChart statusCounts={dashboardData.statusCounts} total={dashboardData.total} />
                                            <ProjectProgress projects={dashboardData.projectCompletion} />                                  
                                            <RecentActivity activity={dashboardData.recentActivity} />
                                            <OverdueTasks tasks={dashboardData.overdueTasks} />
                                        </div>
                                    </>
                                )}
                            </div>

                            {currentOrg.role === 'admin' && (
                                <div className="bg-gray-300 border border-gray-200 rounded-2xl p-6">
                                    <h3 className="text-gray-700 font-semibold mb-1">Invite a team member</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Send an invite link to anyone you want to add to {currentOrg.name}.
                                    </p>

                                    {inviteStatus === 'success' && (
                                        <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                            Invite sent successfully!
                                        </div>
                                    )}
                                    {inviteStatus && inviteStatus !== 'success' && (
                                        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            {inviteStatus}
                                        </div>
                                    )}

                                    <form onSubmit={handleInvite} className="flex gap-3">
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => { setInviteStatus(''); setInviteEmail(e.target.value); }}
                                            placeholder="colleague@example.com"
                                            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-300 border border-gray-400 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={inviteLoading}
                                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-lg transition text-sm flex items-center gap-2"
                                        >
                                            {inviteLoading ? (
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                            ) : 'Send invite'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {showCreateModal && (
                <CreateOrgModal onClose={() => { setShowCreateModal(false); fetchOrgs(); }} />
            )}
        </div>
    );
};

export default DashboardPage;