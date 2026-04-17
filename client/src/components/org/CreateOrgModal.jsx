import { useState } from "react";
import api from '../../api/axios';
import useOrgStore from "../../store/orgStore";
import { X } from "lucide-react";

const CreateOrgModal = ({ onClose }) => {
    const { addOrg } = useOrgStore();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || name.trim().length < 2) {
            setError('Organisation name must be at least 2 characters.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/orgs', { name: name.trim() });
            const { org } = res.data.data;

            // Add to global org store and make it active
            addOrg(org);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create organisation.');
        }
    }

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-500 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Create Organisation</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-900 hover:text-gray-300 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-600/10 border border-red-600/20 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Organisation Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setError(''); setName(e.target.value); }}
                            placeholder="e.g. SoftServ Solutions"
                            autoFocus
                            className="w-full bg-gray-400 rounded-lg px-4 py-2 border border-gray-300 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-300 hover:bg-gray-800 transition text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium transition text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateOrgModal;