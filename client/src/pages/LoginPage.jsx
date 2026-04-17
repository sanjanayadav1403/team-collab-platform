import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, accessToken, refreshToken } = res.data.data;

      // Save to Zustand store + localStorage
      login(user, accessToken, refreshToken);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">TeamCollab</h1>
          <p className="text-gray-800 mt-2 text-sm">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-gray-100 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Welcome back</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-200 text-gray-600 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-200 text-gray-600 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;