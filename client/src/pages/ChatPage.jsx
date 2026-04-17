import { useNavigate } from "react-router-dom";
import { ChevronsLeft } from "lucide-react";
import { useEffect } from "react";
import api from '../api/axios';
import useAuthStore from "../store/authStore";
import useOrgStore from "../store/orgStore";
import useChatStore from '../store/chatStore';
import { initSocket, disconnectSocket, getSocket } from '../socket/socket';
import ChannelSidebar from '../components/chat/ChannelSidebar';
import MessageArea from '../components/chat/MessageArea';

const ChatPage = () => {
    const navigate = useNavigate();
    const { user, accessToken, logout } = useAuthStore();
    const { currentOrg } = useOrgStore();
    const {
        setChannels,
        setDms,
        addMessage,
        setTyping,
        setUserOnline,
        clearChat,
    } = useChatStore();

    // Redirect if no org selected
    useEffect(() => {
        if (!currentOrg) {
            navigate('/dashboard');
        }
    }, [currentOrg]);

    useEffect(() => {
        if (!currentOrg) return;

        // Fetch all channels for this org
        api.get(`/channels/org/${currentOrg.id}`)
            .then((res) => setChannels(res.data.data.channels))
            .catch((err) => console.error('Failed to fetch channels:', err));

        // Fetch DM conversations
        api.get(`/channels/org/${currentOrg.id}/dms`)
            .then((res) => setDms(res.data.data.dms))
            .catch((err) => console.error('Failed to fetch DMs:', err));
    }, [currentOrg?.id]);

    // Initialize socket and register all global events
    useEffect(() => {
        if (!accessToken || !currentOrg) return;

        // Connect socket with token + orgId
        const socket = initSocket(accessToken, currentOrg.id);

        // ── new_message
        // Fired when anyone sends a message in a channel
        socket.on('new_message', (message) => {
            addMessage(message.channel_id, message);
        });

        // ── user_typing
        // Fired when someone starts typing
        socket.on('user_typing', ({ userId, userName, channelId }) => {
            setTyping(channelId, userId, userName, true);
        });

        // ── user_stopped_typing
        socket.on('user_stopped_typing', ({ userId, channelId }) => {
            setTyping(channelId, userId, null, false);
        });

        // ── presence_update
        // Fired when any user comes online or goes offline
        socket.on('presence_update', ({ userId, isOnline }) => {
            setUserOnline(userId, isOnline);
        });

        // ── dm_started
        // Fired after start_dm event — gives us the DM channel
        socket.on('dm_started', ({ channel, targetUserId }) => {
            // Refresh DM list
            api.get(`/channels/org/${currentOrg.id}/dms`)
                .then((res) => setDms(res.data.data.dms))
                .catch(console.error);
        });

        // ── error
        socket.on('error', ({ message }) => {
            console.error('Socket error:', message);
        });

        // Cleanup: disconnect socket when leaving chat page
        return () => {
            socket.off('new_message');
            socket.off('user_typing');
            socket.off('user_stopped_typing');
            socket.off('presence_update');
            socket.off('dm_started');
            socket.off('error');
            disconnectSocket();
            clearChat();
        };
    }, [accessToken, currentOrg?.id]);

    return (
        <div className="h-screen flex bg-gray-200 overflow-hidden">
            <div className="absolute top-3 left-3 z-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1 px-2.5 py-2 mt-10 text-medium font-semibold text-gray-800 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition"
                >
                    <ChevronsLeft />
                    Dashboard
                </button>
            </div>
            {/* Left sidebar */}
            <ChannelSidebar />

            {/* Right message area */}
            <MessageArea />
        </div>
    );
}

export default ChatPage;