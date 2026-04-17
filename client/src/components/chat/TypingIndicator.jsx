import useChatStore from '../../store/chatStore';

const TypingIndicator = ({ channelId }) => {
  const { typingUsers } = useChatStore();
  const typing = typingUsers[channelId] || {};
  const typingNames = Object.values(typing);

  if (typingNames.length === 0) return null;

  const getText = () => {
    if (typingNames.length === 1) return `${typingNames[0]} is typing`;
    if (typingNames.length === 2) return `${typingNames[0]} and ${typingNames[1]} are typing`;
    return `${typingNames[0]} and ${typingNames.length - 1} others are typing`;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-gray-500">
      {/* Animated dots */}
      <div className="flex items-center gap-0.5">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getText()}...</span>
    </div>
  );
};

export default TypingIndicator;