const { getMessagesByChannel } = require('../services/messageService');
const { isChannelMember } = require('../services/channelService');
const { createError } = require('../middleware/errorHandler');

/**
 * GET /api/messages/:channelId
 * Fetch paginated message history for a channel.
 * Query params: limit (default 50), offset (default 0)
 * User must be a channel member.
 */
const getMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Only channel members can read messages
    const isMember = await isChannelMember(channelId, req.user.id);
    if (!isMember) {
      return next(createError(403, 'You are not a member of this channel.'));
    }

    const messages = await getMessagesByChannel(channelId, limit, offset);

    return res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages };