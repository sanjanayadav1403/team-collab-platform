import { TriangleAlert } from "lucide-react";

const TaskCard = ({ task, onClick }) => {

  const priorityConfig = {
    'Immediate': { color: 'bg-red-500/20 text-red-500 border-red-500/30', dot: 'bg-red-400' },
    'Urgent': { color: 'bg-orange-500/20 text-orange-500 border-orange-500/30', dot: 'bg-orange-400' },
    'High': { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', dot: 'bg-yellow-400' },
    'Normal': { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', dot: 'bg-blue-400' },
    'Low': { color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', dot: 'bg-gray-400' },
  };

  const priority = priorityConfig[task.priority?.name] || priorityConfig['Normal'];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short',
    });
  };

  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div
      onClick={() => onClick && onClick(task)}
      className="bg-gray-300 border border-gray-200 rounded-xl p-3.5 cursor-pointer hover:border-indigo-300/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
    >
      <p className="text-sm font-medium text-gray-500 leading-snug mb-2.5 group-hover:text-gray-900 transition-colors line-clamp-2">
        {task.subject}
      </p>

      {/* Priority badge */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${priority.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {task.priority?.name || 'Normal'}
        </span>

        {/* Type badge */}
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-400 text-gray-100 border border-gray-300">
          {task.type}
        </span>
      </div>

      {/* Bottom row — assignee + due date */}
      <div className="flex items-center justify-between mt-1">
        {/* Assignee */}
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-medium">
              {getInitials(task.assignee.name)}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-20">
              {task.assignee.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-700">Unassigned</span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${isOverdue ? "text-red-400 bg-red-500/10" : "text-gray-500"
              }`}
          >
            {isOverdue && <TriangleAlert size={12} className="inline mr-1" />}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
};

export default TaskCard;