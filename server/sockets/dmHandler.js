const {
    findDmChannel,
    createChannel,
    addChannelMember,
} = require('../services/channelService');

const dmHandler = (io, socket) => {
    const user = socket.user;

    socket.on('start_dm', async ({ targetUserId, orgId }) => {
        try {
            if (!targetUserId || !orgId) {
                return socket.emit('error', { message: 'targetUserId and orgId are required' });
            }

            if (targetUserId === user.id) {
                return socket.emit('error', { message: 'You cannot DM yourself.' });
            }

            // Check if DM channel already exists
            let dmChannel = await findDmChannel(user.id, targetUserId, orgId);

            if (!dmChannel) {
                // Create new DM channel
                // Name = both user IDs sorted and joined (ensures uniqueness)
                const dmName = [user.id, targetUserId].sort().join('_dm_');

                dmChannel = await createChannel(
                    orgId,
                    dmName,
                    true,     // is_private = true
                    user.id,
                    true      // is_dm = true
                );

                // Add both users as members
                await addChannelMember(dmChannel.id, user.id);
                await addChannelMember(dmChannel.id, targetUserId);
            }

            // Join initiator's socket to the DM room
            socket.join(dmChannel.id);

            // Find target user's active socket and join them too
            // io.sockets.sockets gives all connected sockets
            const targetSockets = await io.fetchSockets();
            const targetSocket = targetSockets.find(
                (s) => s.user?.id === targetUserId
            );
            if (targetSocket) {
                targetSocket.join(dmChannel.id);
            }

            // Return DM channel info to the initiator
            socket.emit('dm_started', {
                channel: dmChannel,
                targetUserId,
            });
        } catch (err) {
            socket.emit('error', { message: 'Failed to start DM.' });
        }
    })
}

module.exports = dmHandler;