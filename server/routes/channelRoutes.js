const express = require('express');
const router = express.Router();
const {
  createChannelHandler,
  getOrgChannels,
  joinChannel,
  getChannelMembersHandler,
  getDmChannels,
} = require('../controllers/channelController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, createChannelHandler);
router.get('/org/:orgId', authenticate, getOrgChannels);
router.get('/org/:orgId/dms', authenticate, getDmChannels);
router.post('/:channelId/join', authenticate, joinChannel);
router.get('/:channelId/members', authenticate, getChannelMembersHandler);
 
module.exports = router;