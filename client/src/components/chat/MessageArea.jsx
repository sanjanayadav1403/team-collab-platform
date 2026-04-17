import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import useChatStore from '../../store/chatStore';
import { MessageCircleMore } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
// import TypingIndicator from './TypingIndicator';

/**
 * MessageArea
 * Right panel — shows message history + input for active channel.
 */
const MessageArea = () => {
  const { activeChannel, messages, setMessages, prependMessages } = useChatStore();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const channelMessages = activeChannel ? (messages[activeChannel.id] || []) : [];

  // Fetch message history when active channel changes
  useEffect(() => {
    if (!activeChannel) return;

    setLoadingHistory(true);
    setHasMore(true);

    api.get(`/messages/${activeChannel.id}?limit=50&offset=0`)
      .then((res) => {
        const { messages: msgs, pagination } = res.data.data;
        setMessages(activeChannel.id, msgs);
        setHasMore(pagination.hasMore);
      })
      .catch((err) => console.error('Failed to load messages:', err))
      .finally(() => setLoadingHistory(false));
  }, [activeChannel?.id]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  // Load more messages when user scrolls to top
  const handleScroll = async () => {
    const container = containerRef.current;
    if (!container || !hasMore || loadingMore) return;

    if (container.scrollTop === 0) {
      setLoadingMore(true);
      const offset = channelMessages.length;

      try {
        const res = await api.get(
          `/messages/${activeChannel.id}?limit=50&offset=${offset}`
        );
        const { messages: older, pagination } = res.data.data;

        if (older.length > 0) {
          // Save scroll position before prepending
          const prevHeight = container.scrollHeight;
          prependMessages(activeChannel.id, older);

          // Restore scroll position so user doesn't jump
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevHeight;
          });
        }
        setHasMore(pagination.hasMore);
      } catch (err) {
        console.error('Failed to load more messages:', err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // No channel selected
  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-500 flex items-center justify-center mx-auto mb-4">
            <MessageCircleMore size={40}/>
          </div>
          <p className="text-gray-500 text-sm">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-200 min-h-0">

      {/* Channel header */}
      <div className="h-14 border-b border-gray-100 flex items-center px-4 shrink-0">
        <div>
          <p className="text-gray-800 font-semibold text-sm">
            {activeChannel.is_dm ? activeChannel.name : `#${activeChannel.name}`}
          </p>
          <p className="text-gray-500 text-xs">
            {activeChannel.is_private && !activeChannel.is_dm ? 'Private channel' : ''}
          </p>
        </div>
      </div>

      {/* Messages list */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-0.5"
      >
        {/* Load more indicator */}
        {loadingMore && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-600">Loading older messages...</span>
          </div>
        )}

        {/* No more messages */}
        {!hasMore && channelMessages.length > 0 && (
          <div className="text-center py-4">
            <span className="text-xs text-gray-700">Beginning of #{activeChannel.name}</span>
          </div>
        )}

        {/* Loading state */}
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : channelMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No messages yet.</p>
              <p className="text-gray-600 text-xs mt-1">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          channelMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {/* Invisible div to scroll to */}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {/* <TypingIndicator channelId={activeChannel.id} /> */}

      {/* Message input */}
      <MessageInput channelId={activeChannel.id} />
    </div>
  );
};

export default MessageArea;