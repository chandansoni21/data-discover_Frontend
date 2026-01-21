import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, Loader2, CheckCircle, Lock } from 'lucide-react';
import { API } from '../utils/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await API.auth.forgotPassword(email);
            setStep(2);
            setSuccess("OTP sent to your email address.");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to send OTP. Please check your email.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await API.auth.verifyOtp({ email, otp });
            setStep(3);
            setSuccess("OTP verified successfully.");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await API.auth.resetPassword({ email, otp, new_password: newPassword });
            setSuccess("Password reset successfully! Redirecting...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "New Password"}
                    </h2>
                    <p className="text-emerald-200">
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && "Enter the OTP sent to your email"}
                        {step === 3 && "Create a new secure password"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {success}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-emerald-100 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-emerald-100 ml-1">Enter OTP</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                    placeholder="123456"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-emerald-100 ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center text-emerald-200 text-sm">
                    Remember your password?{' '}
                    <Link to="/login" className="text-white font-semibold hover:text-emerald-300 transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
