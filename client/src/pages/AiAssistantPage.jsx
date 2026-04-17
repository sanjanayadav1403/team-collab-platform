import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, FileText, ListTodo, Bot } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useOrgStore from '../store/orgStore';
import useTaskStore from '../store/taskStore';
import useChatStore from '../store/chatStore';
import api from '../api/axios';

const TABS = [
    { id: 'chat', label: 'Chat', Icon: Bot },
    { id: 'summarise', label: 'Summarise Channel', Icon: FileText },
    { id: 'generate', label: 'Generate Desc', Icon: Sparkles },
    { id: 'suggest', label: 'Suggest Tasks', Icon: ListTodo },
];

const PRIORITY_STYLES = {
    high: 'text-red-500 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200',
};

export default function AIAssistantPage() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();
    const { channels = [] } = useChatStore();
    const { projects = [] } = useTaskStore();
    const { currentOrg } = useOrgStore();

    const [activeTab, setActiveTab] = useState('chat');

    // Chat
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI assistant. Ask me anything about project management, task planning, or team productivity." }
    ]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatLoading]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const channelsRes = await api.get(`/channels/org/${currentOrg.id}`);
                useChatStore.getState().setChannels(channelsRes.data.data.channels || []);
            } catch (e) {
                console.error('Channels error:', e);
            }

            try {
                const projectsRes = await api.get(`/openproject/projects`);
                const fetched = projectsRes.data.data.projects || [];

                // ── DEBUG: remove this log once fixed ──
                console.log('Raw projects from API (check what "id" looks like):', fetched);

                useTaskStore.getState().setProjects(fetched);
            } catch (e) {
                console.error('Projects error:', e);
            }
        };

        if (currentOrg?.id) fetchData();
    }, [currentOrg?.id]);

    const sendMessage = async () => {
        const content = input.trim();
        if (!content || chatLoading) return;
        setInput('');

        const newMessages = [...messages, { role: 'user', content }];
        setMessages(newMessages);
        setChatLoading(true);
        try {
            const { data } = await api.post('/ai/chat', {
                messages: newMessages.map(({ role, content }) => ({ role, content }))
            });
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
        } finally {
            setChatLoading(false);
        }
    };

    // Summarise
    const [channelId, setChannelId] = useState('');
    const [summary, setSummary] = useState('');
    const [summariseLoading, setSummariseLoading] = useState(false);

    const handleSummarise = async () => {
        if (!channelId || summariseLoading) return;
        setSummariseLoading(true);
        setSummary('');
        try {
            const { data } = await api.post('/ai/summarise-channel', { channelId });
            setSummary(data.summary);
        } catch (e) {
            setSummary(`Error: ${e.message}`);
        } finally {
            setSummariseLoading(false);
        }
    };

    // Generate desc
    const [taskTitle, setTaskTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [generatedDesc, setGeneratedDesc] = useState('');
    const [generateLoading, setGenerateLoading] = useState(false);

    const handleGenerate = async () => {
        if (!taskTitle.trim() || generateLoading) return;

        // ── DEBUG: log what's actually being sent ──
        console.log('generate → sending projectId:', projectId);

        setGenerateLoading(true);
        setGeneratedDesc('');
        try {
            const { data } = await api.post('/ai/generate-task-description', {
                title: taskTitle,
                projectId: projectId || undefined
            });
            setGeneratedDesc(data.description);
        } catch (e) {
            setGeneratedDesc(`Error: ${e.message}`);
        } finally {
            setGenerateLoading(false);
        }
    };

    // Suggest tasks
    const [suggestProjectId, setSuggestProjectId] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);

    const handleSuggest = async () => {
        if (!suggestProjectId || suggestLoading) return;

        // ── DEBUG: log what's actually being sent ──
        console.log('suggest → sending projectId:', suggestProjectId);

        setSuggestLoading(true);
        setSuggestions([]);
        try {
            const { data } = await api.post('/ai/suggest-tasks', { projectId: suggestProjectId });
            setSuggestions(data.suggestions || []);
        } catch (e) {
            setSuggestions([]);
        } finally {
            setSuggestLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <h1 className="font-semibold text-gray-800">AI Assistant</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-4 flex gap-1">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col gap-4">

                {/* ── CHAT ── */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col flex-1 gap-3">
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto space-y-3 min-h-96 max-h-[60vh]">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask anything…"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400 transition"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || chatLoading}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── SUMMARISE ── */}
                {activeTab === 'summarise' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-0.5">Summarise Channel</h2>
                            <p className="text-sm text-gray-500">Get a summary of the last 60 messages in a channel.</p>
                        </div>
                        <div className="space-y-3">
                            <select
                                value={channelId}
                                onChange={e => { setChannelId(e.target.value); setSummary(''); }}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 transition bg-white"
                            >
                                <option value="">Select a channel…</option>
                                {channels.filter(c => !c.is_dm).map(c => (
                                    <option key={c.id} value={c.id}>#{c.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleSummarise}
                                disabled={!channelId || summariseLoading}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
                            >
                                {summariseLoading ? 'Summarising…' : 'Generate Summary'}
                            </button>
                        </div>
                        {summary && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                {summary}
                            </div>
                        )}
                    </div>
                )}

                {/* ── GENERATE TASK DESC ── */}
                {activeTab === 'generate' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-0.5">Generate Task Description</h2>
                            <p className="text-sm text-gray-500">Enter a task title and get a clear description.</p>
                        </div>
                        <div className="space-y-3">
                            <input
                                value={taskTitle}
                                onChange={e => { setTaskTitle(e.target.value); setGeneratedDesc(''); }}
                                placeholder="e.g. Implement login with Google"
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 transition"
                            />
                            <select
                                value={projectId}
                                onChange={e => setProjectId(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 transition bg-white"
                            >
                                <option value="">Project context (optional)</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleGenerate}
                                disabled={!taskTitle.trim() || generateLoading}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
                            >
                                {generateLoading ? 'Generating…' : 'Generate Description'}
                            </button>
                        </div>
                        {generatedDesc && (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                {generatedDesc}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SUGGEST TASKS ── */}
                {activeTab === 'suggest' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-0.5">Suggest Tasks</h2>
                            <p className="text-sm text-gray-500">AI will suggest 5 tasks based on your project.</p>
                        </div>
                        <div className="space-y-3">
                            <select
                                value={suggestProjectId}
                                onChange={e => { setSuggestProjectId(e.target.value); setSuggestions([]); }}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 transition bg-white"
                            >
                                <option value="">Select a project…</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleSuggest}
                                disabled={!suggestProjectId || suggestLoading}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
                            >
                                {suggestLoading ? 'Thinking…' : 'Suggest Tasks'}
                            </button>
                        </div>
                        {suggestions.length > 0 && (
                            <div className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                                        <span className="text-xs font-bold text-gray-400 mt-0.5 w-4">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800">{s.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0 ${PRIORITY_STYLES[s.priority] || PRIORITY_STYLES.medium}`}>
                                            {s.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}