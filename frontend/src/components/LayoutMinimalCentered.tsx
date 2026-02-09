import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutMinimalCenteredProps {
    children: React.ReactNode;
    title?: string;
}

export default function LayoutMinimalCentered({ children, title }: LayoutMinimalCenteredProps) {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/invoices')}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <span>←</span> Back
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <h1 className="text-lg font-bold text-slate-900">{title || 'Invoice SaaS'}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-slate-600 hidden sm:block">
                            {user?.profile.firstName} {user?.profile.lastName}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {user?.profile.firstName?.[0]}{user?.profile.lastName?.[0]}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content centered */}
            <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 pb-20">
                {children}
            </main>
        </div>
    );
}
