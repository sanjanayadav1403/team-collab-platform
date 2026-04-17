import { useState } from 'react';
import api from '../../api/axios';
import useChatStore from '../../store/chatStore';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
// import OnlineBadge from './OnlineBadge';
import CreateChannelModal from './CreateChannelModal';
import { getSocket } from '../../socket/socket';
import { LoaderCircle, Plus } from 'lucide-react';
import DMModal from './DMModal';

/**
 * ChannelSidebar
 * Left panel showing channels list and DM conversations.
 */
const ChannelSidebar = () => {
    const { currentOrg } = useOrgStore();
    const { user } = useAuthStore();
    const {
        channels,
        dms,
        activeChannel,
        setActiveChannel,
        setMessages,
    } = useChatStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDMModal, setShowDMModal] = useState(false);
    const [loadingChannel, setLoadingChannel] = useState(null);

    // Switch to a channel and load its message history
    const handleChannelClick = async (channel) => {
        if (activeChannel?.id === channel.id) return;

        setActiveChannel(channel);
        setLoadingChannel(channel.id);

        try {
            // Join channel via REST if not already a member
            if (!channel.is_member) {
                await api.post(`/channels/${channel.id}/join`);
                // Tell socket to join the room too
                const socket = getSocket();
                if (socket) socket.emit('join_channel_room', { channelId: channel.id });
            }
        } catch (err) {
            // Already a member — ignore 409 errors
        } finally {
            setLoadingChannel(null);
        }
    };

    // Start or open a DM conversation
    const handleDmClick = (dm) => {
        // DM channel object has id, treat it like a channel
        setActiveChannel({
            id: dm.id,
            name: dm.other_user_name,
            is_dm: true,
            is_private: true,
        });
    };


    return (
        <>
            <aside className="w-64 bg-gray-300 border-r border-gray-200 flex flex-col shrink-0">

                {/* Org name header */}
                <div className="h-14 border-b border-gray-200 flex items-center px-4">
                    <h2 className="text-gray-800 font-semibold text-sm truncate">
                        {currentOrg?.name || 'Workspace'}
                    </h2>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto py-3 mt-10 space-y-4">

                    {/* Channels */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Channels
                            </span>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="text-gray-800 hover:text-white transition"
                                title="Create channel"
                            >
                                <Plus />
                            </button>
                        </div>

                        <div className="space-y-0.5 px-2">
                            {channels.length === 0 ? (
                                <p className="text-xs text-gray-600 px-2 py-1">No channels yet</p>
                            ) : (
                                channels.map((channel) => (
                                    <button
                                        key={channel.id}
                                        onClick={() => handleChannelClick(channel)}
                                        className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition text-left
                      ${activeChannel?.id === channel.id
                                                ? 'bg-indigo-600/30 text-white'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                            }
                    `}
                                    >
                                        <span className="text-gray-500 text-xs">#</span>
                                        <span className="truncate">{channel.name}</span>
                                        {channel.is_private && (
                                            <svg className="w-3 h-3 text-gray-600 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        )}
                                        {loadingChannel === channel.id && (
                                            <LoaderCircle />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Direct Messages
                            </span>
                            <button
                                className='hover:text-white'
                                onClick={() => setShowDMModal(true)}
                                title='New DM'
                            >
                                <Plus />
                            </button>
                        </div>

                        <div className="space-y-0.5 px-2">
                            {dms.length === 0 ? (
                                <p className="text-xs text-gray-600 px-2 py-1">No DMs yet</p>
                            ) : (
                                dms.map((dm) => (
                                    <button
                                        key={dm.id}
                                        onClick={() => handleDmClick(dm)}
                                        className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition text-left
                      ${activeChannel?.id === dm.id
                                                ? 'bg-indigo-600/30 text-white'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                            }
                    `}
                                    >
                                        {/* Avatar with online indicator */}
                                        <div className="relative shrink-0">
                                            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                                {dm.other_user_name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5">
                                                {/* <OnlineBadge userId={dm.other_user_id} /> */}
                                            </div>
                                        </div>
                                        <span className="truncate">{dm.other_user_name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Current user at bottom */}
                <div className="border-t border-gray-200 p-3">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{user?.name}</p>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {showCreateModal && (
                <CreateChannelModal onClose={() => setShowCreateModal(false)} />
            )}
            {showDMModal && (
                <DMModal onClose={() => setShowDMModal(false)} />
            )}
        </>
    );
};

export default ChannelSidebar;