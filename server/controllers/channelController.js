const {
    createChannel,
    getChannelsByOrg,
    getChannelById,
    addChannelMember,
    getChannelMembers,
    isChannelMember,
    getUserDmChannels,
} = require('../services/channelService');
const { getMemberRole } = require('../services/orgService');
const { createError } = require('../middleware/errorHandler');


//Create a new channel. User must be an org member
const createChannelHandler = async (req, res, next) => {
    try {
        const { orgId, name, isPrivate = false } = req.body;

        if (!orgId || !name) {
            return next(createError(400, 'orgId and name are required.'));
        }

        if (name.trim().length < 2) {
            return next(createError(400, 'Channel name must be at least 2 characters.'));
        }

        const role = await getMemberRole(orgId, req.user.id);
        if (!role) {
            return next(createError(403, 'You are not a member of this organisation.'));
        }

        const channel = await createChannel(
            orgId,
            name.trim().toLowerCase().replace(/\s+/g, '-'),
            isPrivate,
            req.user.id
        );

        await addChannelMember(channel.id, req.user.id);

        return res.status(201).json({
            success: true,
            message: 'Channel created successfully.',
            data: { channel },
        });
    } catch (err) {
        if (err.code === '23505') {
            return next(createError(409, 'A channel with this name already exists in the organisation.'));
        }
        next(err);
    }
};

//Get all channels in an org visible to the logged in user
const getOrgChannels = async (req, res, next) => {
    try {
        const {orgId} = req.params;

        const role = await getMemberRole(orgId, req.user.id);
        if(!role) {
            return next(createError(403, 'You are not a member of this organisation.'));
        }

        const channels = await getChannelsByOrg(orgId, req.user.id);

        return res.status(200).json({
            success: true,
            data: {channels},
        });
    } catch (err) {
        console.error('getOrgChannels ERROR:', err.message)
        next(err);
    }
};

//Join a public channel
const joinChannel = async (req, res, next) => {
    try {
        const {channelId} = req.params;
        const channel = await getChannelById(channelId);
        if(!channel) {
            return next(createError(404, 'Channel not found'));
        }

        if(channel.is_private) {
            return next(createError(403, 'This is a private channel. You need an invitation.'));
        }

        if(channel.is_dm) {
            return next(createError(400, 'Cannot join a DM channel directly.'));
        }

        const role = await getMemberRole(channel.org_id, req.user.id);
        if (!role) {
            return next(createError(403, 'You are not a member of this organisation.'));
        }

        await addChannelMember(channelId, req.user.id);

        return res.status(200).json({
            success: true,
            message: `Joined #${channel.name} successfully.`,
            data: {channel},
        });
    } catch (err) {
        next(err);
    }
};

//Get all members of a channel
const getChannelMembersHandler = async (req, res, next) => {
    try {
        const {channelId} = req.params;
        const isMember = await isChannelMember(channelId, req.user.id);
        if(!isMember) {
            return next(createError(403, 'You are not a member of this channel.'));
        }
        const members = await getChannelMembers(channelId);

        return res.status(200).json({
            success: true,
            data: {members},
        });
    } catch (err) {
        next(err);
    }
};

//Get all DM conversations for the logged in user in an org
const getDmChannels = async (req, res, next) => {
    try {
        const {orgId} = req.params;
        const dms = await getUserDmChannels(req.user.id, orgId);

        return res.status(200).json({
            success: true,
            data: {dms},
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createChannelHandler,
    getOrgChannels,
    joinChannel,
    getChannelMembersHandler,
    getDmChannels,
};