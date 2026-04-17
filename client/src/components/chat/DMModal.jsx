import { useState, useEffect } from 'react';
import api from '../../api/axios';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import { getSocket } from '../../socket/socket';
import { X } from 'lucide-react';

const DMModal = ({ onClose }) => {
  const { currentOrg } = useOrgStore();
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    api.get(`/orgs/${currentOrg.id}/members`)
      .then((res) => {
        const others = res.data.data.members.filter((m) => m.id !== user.id);
        setMembers(others);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStartDM = (targetUser) => {
    const socket = getSocket();
    if (!socket) return;

    setStarting(targetUser.id);

    socket.emit('start_dm', {
      targetUserId: targetUser.id,
      orgId: currentOrg.id,
    });

    // dm_started event is handled in ChatPage
    // which will refresh DM list and switch to the channel
    setTimeout(() => {
      setStarting(null);
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 bg-gray/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-300 border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">New Direct Message</h2>
            <p className="text-xs text-gray-600 mt-0.5">Select a member to message</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : members.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No other members in this organisation.
          </p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleStartDM(member)}
                disabled={starting === member.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-400 transition text-left disabled:opacity-60"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {member.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 hover:text-white truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>

                {/* Role badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                  member.role === 'admin'
                    ? 'bg-indigo-600/20 text-indigo-600'
                    : 'bg-gray-600 text-white'
                }`}>
                  {member.role}
                </span>

                {/* Loading spinner */}
                {starting === member.id && (
                  <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DMModal;