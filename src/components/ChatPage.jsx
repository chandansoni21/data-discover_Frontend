import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';

const ChatPage = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Retrieve chat session from storage
        const savedSession = sessionStorage.getItem('activeChatSession');
        if (savedSession) {
            try {
                setSession(JSON.parse(savedSession));
            } catch (e) {
                console.error("Failed to parse chat session:", e);
                navigate('/home');
            }
        } else {
            // No session found, redirect back
            navigate('/home');
        }
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="fixed inset-0 bg-slate-900 z-[60]">
            <ChatInterface
                domain={session.domain}
                fileType={session.fileType}
                visibility={session.visibility}
                isUploadComplete={session.isUploadComplete}
                onClose={() => {
                    sessionStorage.removeItem('activeChatSession');
                    navigate('/home');
                }}
            />
        </div>
    );
};

export default ChatPage;
