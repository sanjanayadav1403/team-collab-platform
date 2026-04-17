const pool = require('../utils/db');

const createMessage = async (channelId, senderId, content, fileUrl = null) => {
    const result = await pool.query(
        `insert into messages (channel_id, sender_id, content, file_url)
        values ($1, $2, $3, $4)
        returning *`,
        [channelId, senderId, content, fileUrl]
    );
    const messageId = result.rows[0].id;
    return getMessageById(messageId);
};

const getMessageById = async (messageId) => {
    const result = await pool.query(
        `SELECT m.*, 
            u.name as sender_name,
            u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = $1`,
        [messageId]
    );
    return result.rows[0] || null;
};

const getMessagesByChannel = async (channelId, limit = 50, offset = 0) => {
    const result = await pool.query(
        `select m.*,
            u.name as sender_name,
            u.avatar_url as sender_avatar
        from messages m
        join users u on m.sender_id = u.id
        where m.channel_id = $1
        order by m.created_at desc
        limit $2 offset $3`,
        [channelId, limit, offset]
    );
    return result.rows.reverse();
};

const markMessageRead = async (messageId, userId) => {
    await pool.query(
        `insert into read_receipts (message_id, user_id)
        values ($1, $2)
        on conflict (message_id, user_id) do nothing`,
        [messageId, userId]
    );
};

const getUnreadCount = async (channelId, userId) => {
    const result = await pool.query(
        `SELECT COUNT(*) as count
     FROM messages m
     WHERE m.channel_id = $1
       AND m.sender_id != $2
       AND NOT EXISTS (
         SELECT 1 FROM read_receipts rr
         WHERE rr.message_id = m.id AND rr.user_id = $2
       )`,
        [channelId, userId]
    );
    return parseInt(result.rows[0].count);
};

const getMessageReadBy = async (messageId) => {
    const result = await pool.query(
        `SELECT u.id, u.name, u.avatar_url, rr.read_at
     FROM read_receipts rr
     JOIN users u ON rr.user_id = u.id
     WHERE rr.message_id = $1`,
        [messageId]
    );
    return result.rows;
};

module.exports = {
    createMessage,
    getMessageById,
    getMessagesByChannel,
    markMessageRead,
    getUnreadCount,
    getMessageReadBy,
};