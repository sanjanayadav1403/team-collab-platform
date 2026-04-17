import { useState } from 'react';
import api from '../../api/axios';
import useChatStore from '../../store/chatStore';
import useOrgStore from '../../store/orgStore';
import { getSocket } from '../../socket/socket';
import { LoaderCircle, X } from 'lucide-react';

/**
 * CreateChannelModal
 * Modal to create a new public or private channel.
 */
const CreateChannelModal = ({ onClose }) => {
  const { currentOrg } = useOrgStore();
  const { addChannel, setActiveChannel } = useChatStore();

  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Channel name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/channels', {
        orgId: currentOrg.id,
        name: name.trim(),
        isPrivate,
      });

      const { channel } = res.data.data;

      // Add to store
      addChannel(channel);

      // Tell socket to join the new channel room
      const socket = getSocket();
      if (socket) {
        socket.emit('join_channel_room', { channelId: channel.id });
      }

      // Switch to the new channel
      setActiveChannel(channel);

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel.');
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Create Channel</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Channel name
            </label>
            <div className="flex items-center bg-gray-400 border border-gray-300 rounded-lg px-3 focus-within:border-indigo-500 transition">
              <span className="text-gray-500 mr-1">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => { setError(''); setName(e.target.value); }}
                placeholder="e.g. general, design, backend"
                autoFocus
                className="flex-1 py-2.5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Lowercase, no spaces (auto-converted)</p>
          </div>

          {/* Private toggle */}
          <div
            className="flex items-center justify-between p-3 bg-gray-400 rounded-lg border border-gray-300 cursor-pointer"
            onClick={() => setIsPrivate(!isPrivate)}
          >
            <div>
              <p className="text-sm font-medium text-gray-700">Private channel</p>
              <p className="text-xs text-gray-500 mt-0.5">Only invited members can join</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-gray-700' : 'bg-white'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-gray-900 rounded-full transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-800 hover:text-white transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium transition text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoaderCircle />
              ) : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;