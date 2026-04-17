import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import useOrgStore from '../store/orgStore';

const JoinOrgPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addOrg } = useOrgStore();

  const token = searchParams.get('token');

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invite link. No token found.');
      return;
    }

    // If not logged in — redirect to login, preserve invite token in URL
    if (!isAuthenticated) {
      navigate(`/login?redirect=/join?token=${token}`);
      return;
    }

    // Auto-join on page load
    handleJoin();
  }, [token, isAuthenticated]);

  const handleJoin = async () => {
    setStatus('loading');
    try {
      const res = await api.post('/orgs/join', { token });
      const { org } = res.data.data;

      setOrgName(org.name);
      addOrg(org);
      setStatus('success');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to join organisation.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-6">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Loading state */}
        {status === 'loading' && (
          <div>
            <svg className="animate-spin w-8 h-8 text-indigo-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Joining organisation...</h2>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment.</p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">You're in!</h2>
            <p className="text-gray-400 text-sm mt-2">
              You've successfully joined <span className="text-white font-medium">{orgName}</span>.
            </p>
            <p className="text-gray-600 text-xs mt-3">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Invite failed</h2>
            <p className="text-red-400 text-sm mt-2">{message}</p>
            <Link
              to="/dashboard"
              className="inline-block mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinOrgPage;