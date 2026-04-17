const pool = require('../utils/db');

const createChannel = async (orgId, name, isPrivate = false, createdBy, isDm = false) => {
    const result = await pool.query(
        `insert into channels (org_id, name, is_private, created_by, is_dm)
        values ($1, $2, $3, $4, $5)
        returning *`,
        [orgId, name, isPrivate, createdBy, isDm]
    );
    return result.rows[0];
};

const getChannelsByOrg = async (orgId, userId) => {
  const result = await pool.query(
    `SELECT c.*, 
            CASE WHEN cm.user_id IS NOT NULL THEN true ELSE false END as is_member
     FROM channels c
     LEFT JOIN channel_members cm 
       ON c.id = cm.channel_id AND cm.user_id = $2
     WHERE c.org_id = $1 
       AND c.is_dm = false
       AND (c.is_private = false OR cm.user_id IS NOT NULL)
     ORDER BY c.created_at ASC`,
    [orgId, userId]
  );
  return result.rows;
};

const getChannelById = async (channelId) => {
    const result = await pool.query(
        `select * from channels where id = $1`,
        [channelId]
    );
    return result.rows[0] || null;
};

const addChannelMember = async (channelId, userId) => {
    const result = await pool.query(
        `insert into channel_members (channel_id, user_id)
        values ($1, $2)
        on conflict (channel_id, user_id) do nothing
        returning *`,
        [channelId, userId]
    );
    return result.rows[0];
};

const getChannelMembers = async (channelId) => {
    const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.avatar_url, u.is_online, cm.joined_at
        FROM users u
        JOIN channel_members cm ON u.id = cm.user_id
        WHERE cm.channel_id = $1
        ORDER BY cm.joined_at ASC`,
        [channelId]
    );
    return result.rows;
};

const isChannelMember = async (channelId, userId) => {
    const result = await pool.query(
        `select id from channel_members where channel_id = $1 and user_id = $2`,
        [channelId, userId]
    );
    return result.rows.length > 0;
};

const getUserChannels = async (userId, orgId) => {
    const result = await pool.query(
        `select c.id, c.name, c.is_private, c.is_dm
        from channels c
        join channel_members cm on c.id = cm.channel_id
        where cm.user_id = $1 and c.org_id = $2`,
        [userId, orgId]
    );
    return result.rows;
};

const findDmChannel = async (userId1, userId2, orgId) => {
    const result = await pool.query(
        `select c.* from channels c
        join channel_members cm1 on c.id = cm1.channel_id and cm1.user_id = $1
        join channel_members cm2 on c.id = cm2.channel_id and cm2.user_id = $2
        where c.is_dm = true and c.org_id = $3
        limit 1`,
        [userId1, userId2, orgId]
    );
    return result.rows[0] || null;
}; 

const getUserDmChannels = async (userId, orgId) => {
    const result = await pool.query(
        `SELECT c.id, c.created_at,
            u.id as other_user_id,
            u.name as other_user_name,
            u.avatar_url as other_user_avatar,
            u.is_online as other_user_online
        FROM channels c
        JOIN channel_members cm ON c.id = cm.channel_id AND cm.user_id = $1
        JOIN channel_members cm2 ON c.id = cm2.channel_id AND cm2.user_id != $1
        JOIN users u ON u.id = cm2.user_id
        WHERE c.is_dm = true AND c.org_id = $2
        ORDER BY c.created_at DESC`,
        [userId, orgId]
    );
    return result.rows;
};

module.exports = {
    createChannel,
    getChannelsByOrg,
    getChannelById,
    addChannelMember,
    getChannelMembers,
    isChannelMember,
    getUserChannels,
    findDmChannel,
    getUserDmChannels,
};