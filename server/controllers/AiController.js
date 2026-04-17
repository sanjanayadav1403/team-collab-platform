const { GoogleGenAI } = require("@google/genai");
const pool = require('../utils/db');
const {
    getProjectById,
    getProjectTasks,
} = require('../services/openProjectService');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const geminiChat = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
};

// POST /api/ai/summarise-channel
const summariseChannel = async (req, res, next) => {
    try {
        const { channelId } = req.body;

        if (!channelId) {
            return res.status(400).json({ success: false, message: 'channelId is required.' });
        }

        const { rows } = await pool.query(
            `SELECT m.content, u.name AS sender_name
             FROM messages m
             LEFT JOIN users u ON u.id = m.sender_id
             WHERE m.channel_id = $1 AND m.content IS NOT NULL
             ORDER BY m.created_at DESC LIMIT 60`,
            [channelId]
        );

        if (rows.length === 0) {
            return res.json({ success: true, summary: 'No messages in this channel yet.' });
        }

        const transcript = rows
            .reverse()
            .map(m => `${m.sender_name}: ${m.content}`)
            .join('\n');

        const summary = await geminiChat(
            `You are a helpful workspace assistant.

Summarise this chat in under 120 words.
Highlight key decisions and action items.

${transcript}`
        );

        res.json({ success: true, summary });

    } catch (err) {
        next(err);
    }
};

// POST /api/ai/generate-task-description
const generateTaskDescription = async (req, res, next) => {
    try {
        const { title, projectId } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'title is required.' });
        }

        let projectContext = '';

        if (projectId) {
            const project = await getProjectById(projectId);

            if (project) {
                projectContext = `Project: "${project.name}" ${project.description?.raw || ''}`;
            }
        }

        const description = await geminiChat(
            `You are a project management assistant.

Write a clear and actionable task description in under 80 words.

${projectContext}

Task title: "${title}"`
        );

        res.json({ success: true, description });

    } catch (err) {
        next(err);
    }
};

// POST /api/ai/suggest-tasks
const suggestTasks = async (req, res, next) => {
    try {
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'projectId is required.' });
        }

        const project = await getProjectById(projectId);

        if (!project) {
            return res.status(400).json({ success: false, message: 'Project not found.' });
        }

        const tasks = await getProjectTasks(projectId);

        const taskList = tasks.length
            ? tasks.map(t => `- [${t.status?.title || 'Unknown'}] ${t.subject}`).join('\n')
            : 'No tasks yet.';

        const text = await geminiChat(
            `You are a project management assistant.

Project: "${project.name}"
${project.description || ''}

Existing tasks:
${taskList}

Suggest 5 new tasks.

IMPORTANT:
- Respond ONLY in valid JSON
- No explanation
- No markdown

Format:
[{"title":"...","priority":"medium","reason":"..."}]`
        );

        let suggestions = [];
        try {
            suggestions = JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch {
            suggestions = [];
        }

        res.json({ success: true, suggestions });

    } catch (err) {
        next(err);
    }
};

// POST /api/ai/chat
const chatWithAssistant = async (req, res, next) => {
    try {
        const { messages } = req.body;

        if (!messages?.length) {
            return res.status(400).json({ success: false, message: 'messages array is required.' });
        }

        const formattedMessages = messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        const reply = await geminiChat(
            `You are a helpful workspace assistant for a team collaboration tool.
Help with task planning, project management, writing, and productivity.
Be concise and friendly.

${formattedMessages}

assistant:`
        );

        res.json({ success: true, reply });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    summariseChannel,
    generateTaskDescription,
    suggestTasks,
    chatWithAssistant
};