import { useState, useRef, useCallback } from 'react';
import { getSocket } from '../../socket/socket';
import useChatStore from '../../store/chatStore';

/**
 * MessageInput
 * Textarea for composing messages.
 * Handles typing indicators with debounce and Enter to send.
 */
const MessageInput = ({ channelId }) => {
  const [content, setContent] = useState('');
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const { activeChannel } = useChatStore();

  // Emit typing_stop and clean up
  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (socket && isTypingRef.current) {
      socket.emit('typing_stop', { channelId });
      isTypingRef.current = false;
    }
  }, [channelId]);

  const handleChange = (e) => {
    setContent(e.target.value);

    const socket = getSocket();
    if (!socket) return;

    // Start typing indicator if not already
    if (!isTypingRef.current) {
      socket.emit('typing_start', { channelId });
      isTypingRef.current = true;
    }

    // Reset debounce timer — stop typing after 2s of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const socket = getSocket();
    if (!socket) return;

    // Emit send_message event to backend
    socket.emit('send_message', {
      channelId,
      content: trimmed,
    });

    // Clear input and stop typing
    setContent('');
    clearTimeout(typingTimeoutRef.current);
    stopTyping();
  };

  // Enter = send, Shift+Enter = new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const channelName = activeChannel?.name || 'channel';

  return (
    <div className="px-4 py-3 border-t border-gray-300">
      <div className="flex items-end gap-2 bg-gray-300 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-indigo-500 transition">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-500 resize-none focus:outline-none leading-relaxed max-h-32 overflow-y-auto"
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            // Auto resize textarea
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition shrink-0 mb-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1.5 px-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default MessageInput;