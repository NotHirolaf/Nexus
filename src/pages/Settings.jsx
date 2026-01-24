import React, { useState } from 'react';
import { Trash2, AlertTriangle, Check, RefreshCw, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    const [isResetting, setIsResetting] = useState(false);

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            setIsResetting(true);
            // Simulate a short delay for better UX
            setTimeout(() => {
                localStorage.clear();
                window.location.reload();
            }, 800);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-gray-500" />
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your application preferences and data.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-red-500 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-bold text-black dark:text-white">Danger Zone</h3>
                        <p className="text-black dark:text-gray-400 text-sm leading-relaxed">
                            This action will permanently delete all your local data, including courses, grades, schedule, and preferences.
                            The application will be reset to its initial state, as if you just installed it.
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleClearData}
                        disabled={isResetting}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isResetting ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" />
                                Reset All Data
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
