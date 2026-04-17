import useChatStore from '../../store/chatStore';


const OnlineBadge = ({ userId, size = 'sm' }) => {
  const { onlineUsers } = useChatStore();
  const isOnline = onlineUsers.has(userId);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  };

  return (
    <span
      className={`
        inline-block rounded-full shrink-0
        ${sizeClasses[size]}
        ${isOnline ? 'bg-green-400' : 'bg-gray-600'}
      `}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineBadge;