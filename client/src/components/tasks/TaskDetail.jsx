import { SquareArrowOutUpRight, X } from "lucide-react";

/**
 * TaskDetail
 * Slide-in panel showing full task details.
 */
const TaskDetail = ({ task, onClose }) => {
  if (!task) return null;

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const priorityColors = {
    'Immediate': 'text-red-400',
    'Urgent': 'text-orange-400',
    'High': 'text-yellow-400',
    'Normal': 'text-blue-400',
    'Low': 'text-gray-400',
  };

  return (
    <div className="fixed inset-0 bg-gray/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-gray-300 border-l border-gray-200 h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-400 border-b border-gray-300 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">#{task.id} · {task.type}</p>
            <h2 className="text-white font-semibold text-base leading-snug">{task.subject}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition mt-1">
            <X />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Status</p>
              <span className="inline-block px-3 py-1 bg-indigo-600/20 text-indigo-500 text-sm rounded-full border border-indigo-500/30">
                {task.status?.name}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Priority</p>
              <span className={`text-sm font-medium ${priorityColors[task.priority?.name] || 'text-gray-400'}`}>
                ● {task.priority?.name || 'Normal'}
              </span>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Assignee</p>
            {task.assignee ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                  {task.assignee.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span className="text-sm text-gray-300">{task.assignee.name}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">Unassigned</span>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Start Date</p>
              <p className="text-sm text-gray-300">{formatDate(task.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Due Date</p>
              <p className={`text-sm ${
                task.dueDate && new Date(task.dueDate) < new Date()
                  ? 'text-red-400'
                  : 'text-gray-300'
              }`}>
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>

          {/* Project */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Project</p>
            <p className="text-sm text-gray-300">{task.project?.name}</p>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1.5">Description</p>
              <div className="bg-gray-300 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-200">
                {task.description || 'No description provided.'}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Created</p>
                <p className="text-xs text-gray-500">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Updated</p>
                <p className="text-xs text-gray-500">{formatDate(task.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Open in OpenProject link */}
          <a
            href={`${import.meta.env.VITE_OPENPROJECT_URL}/work_packages/${task.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/10 transition text-sm font-medium"
          >
            <SquareArrowOutUpRight size={16}/>
            Open in OpenProject
          </a>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;