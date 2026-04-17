/**
 * OverdueTasks
 * List of tasks past their due date.
 */
const OverdueTasks = ({ tasks }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const getDaysOverdue = (dueDate) => {
    const diff = Date.now() - new Date(dueDate).getTime();
    return Math.floor(diff / 86400000);
  };

  const priorityColors = {
    'Immediate': 'text-red-400',
    'Urgent':    'text-orange-400',
    'High':      'text-yellow-400',
    'Normal':    'text-blue-400',
    'Low':       'text-gray-400',
  };

  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="bg-gray-300 border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-800 font-semibold">Overdue Tasks</h3>
          <p className="text-gray-600 text-xs mt-0.5">Tasks past their due date</p>
        </div>
        {tasks.length > 0 && (
          <span className="px-2.5 py-1 bg-red-400/20 text-red-500 text-xs font-semibold rounded-full border border-red-500/20">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-gray-700 text-sm font-medium">No overdue tasks!</p>
          <p className="text-gray-600 text-xs mt-1">Everything is on track.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {tasks.map((task) => {
            const daysOverdue = getDaysOverdue(task.dueDate);

            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-red-400/5 border border-red-400/10 hover:border-red-500/20 transition"
              >
                {/* Assignee */}
                <div className="w-7 h-7 rounded-full bg-red-800/50 flex items-center justify-center text-red-300 text-xs font-bold shrink-0 mt-0.5">
                  {task.assignee ? getInitials(task.assignee.name) : '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 line-clamp-1" title={task.subject}>
                    {task.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-medium ${priorityColors[task.priority?.name] || 'text-gray-400'}`}>
                      ● {task.priority?.name || 'Normal'}
                    </span>
                    <span className="text-xs text-gray-600">{task.project?.name}</span>
                  </div>
                </div>

                {/* Overdue info */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-red-400 font-medium">{daysOverdue}d overdue</p>
                  <p className="text-xs text-gray-600 mt-0.5">{formatDate(task.dueDate)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OverdueTasks;