/**
 * StatusChart
 * Bar chart showing task counts by status.
 * Pure CSS — no external chart library needed.
 */
const StatusChart = ({ statusCounts, total }) => {
  const statusColors = {
    'New':         { bg: 'bg-gray-500', text: 'text-gray-400', bar: '#6b7280' },
    'In progress': { bg: 'bg-blue-500', text: 'text-blue-400', bar: '#3b82f6' },
    'In Progress': { bg: 'bg-blue-500', text: 'text-blue-400', bar: '#3b82f6' },
    'Resolved':    { bg: 'bg-green-500', text: 'text-green-400', bar: '#22c55e' },
    'Closed':      { bg: 'bg-emerald-600', text: 'text-emerald-400', bar: '#059669' },
    'On hold':     { bg: 'bg-yellow-500', text: 'text-yellow-400', bar: '#eab308' },
    'Rejected':    { bg: 'bg-red-500', text: 'text-red-400', bar: '#ef4444' },
  };

  const entries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Tasks by Status</h3>
          <p className="text-gray-500 text-xs mt-0.5">{total} total tasks</p>
        </div>
        <div className="text-2xl font-bold text-white">{total}</div>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-6">No tasks found</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([status, count]) => {
            const colors = statusColors[status] || { bg: 'bg-indigo-500', text: 'text-indigo-400', bar: '#6366f1' };
            const pct = Math.round((count / maxCount) * 100);
            const totalPct = Math.round((count / total) * 100);

            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                    <span className="text-sm text-gray-300">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${colors.text}`}>{totalPct}%</span>
                    <span className="text-sm font-semibold text-white w-6 text-right">{count}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${colors.bg}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusChart;