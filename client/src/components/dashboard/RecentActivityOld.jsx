/**
 * RecentActivity
 * Feed of recently updated tasks.
 */
const RecentActivity = ({ activity }) => {
  const formatRelativeTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const statusColors = {
    'New':         'bg-gray-500/20 text-gray-400',
    'In progress': 'bg-blue-500/20 text-blue-400',
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Resolved':    'bg-green-500/20 text-green-400',
    'Closed':      'bg-emerald-500/20 text-emerald-400',
    'On hold':     'bg-yellow-500/20 text-yellow-400',
    'Rejected':    'bg-red-500/20 text-red-400',
  };

  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-white font-semibold">Recent Activity</h3>
        <p className="text-gray-500 text-xs mt-0.5">Latest task updates</p>
      </div>

      {activity.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-800/50 transition">
              {/* Assignee avatar */}
              <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                {item.assignee ? getInitials(item.assignee.name) : '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-snug line-clamp-1" title={item.subject}>
                  {item.subject}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {/* Status badge */}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    statusColors[item.status?.name] || 'bg-gray-700 text-gray-400'
                  }`}>
                    {item.status?.name}
                  </span>
                  <span className="text-xs text-gray-600 truncate">
                    {item.project?.name}
                  </span>
                </div>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-600 shrink-0 mt-0.5">
                {formatRelativeTime(item.updatedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;