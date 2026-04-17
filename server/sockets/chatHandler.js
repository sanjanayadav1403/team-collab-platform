const {createMessage, markMessageRead} = require('../services/messageService');
const {isChannelMember} = require('../services/channelService');

const chatHandler = (io, socket) => {
    const user = socket.user;

    socket.on('send_message', async ({channelId, content, fileUrl = null}) => {
        try {
            if(!channelId || (!content?.trim() && !fileUrl)) {
                return socket.emit('error', {message: 'channelId and content are required'});
            }

            const isMember = await isChannelMember(channelId, user.id);
            if(!isMember) {
                return socket.emit('error', {message: 'You are not a member of this channel'});
            }

            const message = await createMessage(channelId, user.id, content?.trim(), fileUrl);

            io.to(channelId).emit('new_message', {
                ...message,
                isMine: false,
            });

        } catch (err) {
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    socket.on('message_read', async ({messageId, senderId, channelId}) => {
        try {
            if(!messageId) {
                return;
            }
            
            if(senderId === user.id) return;

            await markMessageRead(messageId, user.id);

            io.to(channelId).emit('message_read_ack', {
                messageId,
                readBy: {
                    id: user.id,
                    name: user.name,
                },
            });
        } catch (err) {
            console.error('message_read error:', err.message);
        }
    });
}

module.exports = chatHandler;