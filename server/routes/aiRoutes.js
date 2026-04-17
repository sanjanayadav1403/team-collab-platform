const express = require('express');
const router = express.Router();

const {
  summariseChannel,
  generateTaskDescription,
  suggestTasks,
  chatWithAssistant
} = require('../controllers/AiController');
const authenticate = require('../middleware/authenticate');


// Summarise channel messages
router.post('/summarise-channel', authenticate, summariseChannel);

// Generate task description
router.post('/generate-task-description', authenticate, generateTaskDescription);

// Suggest tasks for a project
router.post('/suggest-tasks', authenticate , suggestTasks);

// Chat with AI assistant
router.post('/chat', authenticate, chatWithAssistant);

module.exports = router;