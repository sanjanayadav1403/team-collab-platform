import { Paperclip } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const MessageBubble = ({ message }) => {
  const { user } = useAuthStore();
  const isMine = message.sender_id === user?.id;

  // Format timestamp: "2:30 PM"
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get initials for avatar
  const getInitials = (name) =>
    name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className={`flex gap-2.5 group px-4 py-1 hover:bg-gray-300/40 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
        {getInitials(message.sender_name)}
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>

        {/* Sender name + time */}
        <div className={`flex items-baseline gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs font-semibold text-gray-500">
            {isMine ? 'You' : message.sender_name}
          </span>
          <span className="text-xs text-gray-600">
            {formatTime(message.created_at)}
          </span>
        </div>

        {/* Message content */}
        {message.content && (
          <div
            className={`
              px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-word
              ${isMine
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-gray-800 text-gray-100 rounded-tl-sm'
              }
            `}
          >
            {message.content}
          </div>
        )}

        {/* File attachment */}
        {message.file_url && (
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 px-3 py-2 bg-gray-300 rounded-xl text-sm text-indigo-400 hover:text-indigo-300 transition border border-gray-200"
          >
            <Paperclip />
            Attachment
          </a>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;