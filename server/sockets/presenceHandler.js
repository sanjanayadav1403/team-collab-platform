const { updateOnlineStatus } = require('../services/authService');

const presenceHandler = (io, socket) => {
    const user = socket.user;

    socket.on('typing_start', ({ channelId }) => {
        if (!channelId) return;

        socket.to(channelId).emit('user_typing', {
            userId: user.id,
            userName: user.name,
            channelId,
        });
    });

    socket.on('typing_stop', ({ channelId }) => {
        if (!channelId) return;

        socket.to(channelId).emit('user_stopped_typing', {
            userId: user.id,
            channelId,
        });
    });

    socket.on('disconnect', async () => {
        try {
            await updateOnlineStatus(user.id, false);

            socket.rooms.forEach((room) => {
                socket.to(room).emit('presence_update', {
                    userId: user.id,
                    isOnline: false,
                });
            });
        } catch (err) {
            console.error('Error on disconnect:', err.message);
        }
    });
};

module.exports = presenceHandler;