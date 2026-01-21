import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import UnifiedChatInterface from './UnifiedChatInterface';

const UnifiedChatPage = () => {
    const navigate = useNavigate();
    const { dbName } = useParams();
    const [searchParams] = useSearchParams();
    const visibility = searchParams.get('visibility') || 'local';

    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!dbName) {
            navigate('/home');
            return;
        }

        // In a real app, we might verify if the DB exists here
        setIsValid(true);
        setLoading(false);
    }, [dbName, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-500 font-medium animate-pulse">Initializing Unified Workspace...</p>
                </div>
            </div>
        );
    }

    if (!isValid) return null;

    return (
        <div className="h-screen w-full bg-slate-900">
            <UnifiedChatInterface
                dbName={dbName}
                visibility={visibility}
            />
        </div>
    );
};

export default UnifiedChatPage;
