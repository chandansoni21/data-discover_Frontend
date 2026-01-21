import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatInterface from './ChatInterface';

const ChatPage = () => {
    const navigate = useNavigate();
    const { dbName } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Retrieve chat session from storage
        const savedSession = sessionStorage.getItem('activeChatSession');
        let parsedSession = null;

        if (savedSession) {
            try {
                parsedSession = JSON.parse(savedSession);
            } catch (e) {
                console.error("Failed to parse chat session:", e);
            }
        }

        if (dbName) {
            // URL has priority. 
            // If we have a session and it matches the URL, use it.
            // If we don't have a session or it mismatches, we'll try to use the URL param
            // In a real app, we might need to fetch session details from backend using dbName here

            if (parsedSession && (parsedSession.dbName === dbName || parsedSession.domain?.name === dbName)) {
                setSession(parsedSession);
            } else {
                // Create a minimal session from URL param if explicit session is missing/mismatch
                // This allows shared URLs to work (frontend will fetch history in ChatInterface)
                setSession({
                    domain: { name: dbName },
                    dbName: dbName,
                    fileType: 'pdf', // Default or need fetch
                    visibility: 'private', // Default
                    isUploadComplete: true
                });
            }
        } else if (parsedSession) {
            // No URL param, but we have session. 
            // We should probably redirect to the specific URL for consistency
            const name = parsedSession.dbName || parsedSession.domain?.name;
            if (name) {
                navigate(`/chat/${encodeURIComponent(name)}`, { replace: true });
                setSession(parsedSession);
            } else {
                setSession(parsedSession);
            }
        } else {
            // No session and no URL param -> redirect home
            navigate('/home');
        }
        setLoading(false);
    }, [navigate, dbName]);

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
                dbName={session.dbName || session.domain?.name}
                onClose={() => {
                    sessionStorage.removeItem('activeChatSession');
                    navigate('/home');
                }}
            />
        </div>
    );
};

export default ChatPage;
