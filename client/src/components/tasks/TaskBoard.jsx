import { useState } from 'react';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';

/**
 * TaskBoard
 * Kanban-style board showing tasks grouped by status.
 */
const TaskBoard = ({ groupedTasks, loading }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  // Status color mapping
  const statusColors = {
    'New':          'border-gray-600 text-gray-400',
    'In progress':  'border-blue-500 text-blue-400',
    'In Progress':  'border-blue-500 text-blue-400',
    'Completed':     'border-green-500 text-green-400',
    'Closed':       'border-gray-700 text-gray-600',
    'Re Open':      'border-yellow-500 text-yellow-400',
    'Rejected':     'border-red-500 text-red-400',
  };

  const statusOrder = [
    'New', 'In progress', 'In Progress', 'On hold', 'Resolved', 'Closed', 'Rejected'
  ];

  // Sort columns by status order, unknown statuses go to end
  const sortedStatuses = Object.keys(groupedTasks).sort((a, b) => {
    const ai = statusOrder.indexOf(a);
    const bi = statusOrder.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-indigo-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading tasks from OpenProject...</p>
        </div>
      </div>
    );
  }

  if (sortedStatuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No tasks found in this project.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {sortedStatuses.map((status) => {
          const tasks = groupedTasks[status] || [];
          const colorClass = statusColors[status] || 'border-gray-700 text-gray-500';

          return (
            <div key={status} className="shrink-0 w-72">
              {/* Column header */}
              <div className={`flex items-center justify-between mb-3 pb-2 border-b ${colorClass}`}>
                <h3 className="text-sm font-semibold">{status}</h3>
                <span className="text-xs bg-gray-400 px-2 py-0.5 rounded-full text-gray-100">
                  {tasks.length}
                </span>
              </div>

              {/* Task cards */}
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={setSelectedTask}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};

export default TaskBoard;