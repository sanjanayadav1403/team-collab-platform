const express = require('express');
const router = express.Router();
const {getMessages} = require('../controllers/messageController');
const authenticate = require('../middleware/authenticate');

router.get('/:channelId', authenticate, getMessages);
 
module.exports = router;