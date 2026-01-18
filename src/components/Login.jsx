import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { API } from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        "username or email_id": "",
        "password": ""
    });
    const [error, setError] = useState("");

    const formatError = (err) => {
        const detail = err?.response?.data?.detail || err?.response?.data || err?.message || err;
        if (!detail) return '';
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) return detail.map(d => (d?.msg || d?.message || JSON.stringify(d))).join(', ');
        if (typeof detail === 'object') return detail.message || detail.detail || JSON.stringify(detail);
        return String(detail);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await API.auth.login({
                username: formData["username or email_id"],
                password: formData.password
            });

            const { access_token, refresh_token } = response.data;

            sessionStorage.setItem('access_token', access_token);
            sessionStorage.setItem('refresh_token', refresh_token);
            sessionStorage.setItem('email', formData["username or email_id"]);

            const pendingDomainId = sessionStorage.getItem('pendingDomainId');
            navigate('/home', { state: { domainId: pendingDomainId } });
        } catch (err) {
            console.error("Login Error:", err);
            setError(formatError(err) || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-blue-200">Sign in to continue to DataDiscover.AI</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-100 ml-1">Username or Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                            <input
                                type="text"
                                name="username or email_id"
                                value={formData["username or email_id"]}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-blue-100">Password</label>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-blue-500/30 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs text-blue-300 hover:text-white transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-blue-200 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-white font-semibold hover:text-blue-300 transition-colors">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
