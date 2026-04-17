/**
 * Leaderboard
 * Team activity leaderboard — tasks completed per member.
 */
const Leaderboard = ({ leaderboard }) => {
  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const medalColors = ['text-yellow-400', 'text-gray-400', 'text-orange-600'];
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="mb-5">
        <h3 className="text-white font-semibold">Team Leaderboard</h3>
        <p className="text-gray-500 text-xs mt-0.5">Tasks completed per member</p>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-6">No data available</p>
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((member, index) => (
            <div
              key={member.name}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${
                index === 0 ? 'bg-yellow-500/5 border border-yellow-500/10' : 'hover:bg-gray-800/50'
              } transition`}
            >
              {/* Rank */}
              <div className="w-6 text-center shrink-0">
                {index < 3 ? (
                  <span className="text-base">{medals[index]}</span>
                ) : (
                  <span className="text-xs text-gray-600 font-medium">{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                index === 0 ? 'bg-yellow-600' :
                index === 1 ? 'bg-gray-600' :
                index === 2 ? 'bg-orange-700' :
                'bg-indigo-700'
              }`}>
                {getInitials(member.name)}
              </div>

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{member.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-green-400">{member.tasksCompleted} done</span>
                  <span className="text-xs text-gray-700">·</span>
                  <span className="text-xs text-blue-400">{member.tasksInProgress} active</span>
                </div>
              </div>

              {/* Total */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white">{member.total}</p>
                <p className="text-xs text-gray-600">total</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;