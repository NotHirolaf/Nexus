
import React, { useState } from 'react';
import { Trash2, AlertTriangle, Check, RefreshCw, Settings as SettingsIcon, Plus, X, User, LogOut, Cloud, CloudOff, Link } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useDataSync } from '../context/DataSyncContext';
import { useNotification } from '../context/NotificationContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Settings() {
    const { user, updateCourses, clearUser } = useUser();
    const { user: authUser, isAuthenticated, signInWithGoogle, signOut } = useAuth();
    const { isSyncing, lastSync, storageMode } = useDataSync();
    const { notify, confirm } = useNotification();
    const [isResetting, setIsResetting] = useState(false);
    const [newCourse, setNewCourse] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleLinkAccount = async () => {
        setIsSigningIn(true);
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                notify('success', 'Account linked! Your data is now syncing to the cloud.');
            } else {
                notify('error', result.error || 'Failed to link account');
            }
        } catch (error) {
            notify('error', error.message);
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleSignOut = async () => {
        const isConfirmed = await confirm({
            title: 'Sign Out?',
            message: 'You will be signed out and returned to the welcome screen. Your data will be cleared from this device.',
            confirmText: 'Sign Out',
            type: 'warning'
        });

        if (isConfirmed) {
            setIsSigningOut(true);
            try {
                await signOut();
                // Clear all local data so user returns to onboarding
                clearUser();
                localStorage.removeItem('nexus_tasks');
                localStorage.removeItem('nexus_flashcards');
                localStorage.removeItem('nexus_quizzes');
                localStorage.removeItem('nexus_grades');
                localStorage.removeItem('nexus_timetable');
                notify('success', 'Signed out successfully');
            } catch (error) {
                notify('error', 'Failed to sign out');
            } finally {
                setIsSigningOut(false);
            }
        }
    };

    const handleAddCourse = (e) => {
        e.preventDefault();
        const trimmed = newCourse.trim();
        if (!trimmed) return;

        if (user.courses.includes(trimmed)) {
            notify('warning', 'Course already exists!');
            return;
        }

        updateCourses([...user.courses, trimmed]);
        notify('success', `Added ${trimmed} `);
        setNewCourse('');
    };

    const handleDeleteCourse = async (courseToDelete) => {
        const isConfirmed = await confirm({
            title: `Remove ${courseToDelete}?`,
            message: "This won't delete grade data until you do a full reset, but it will hide it from menus.",
            confirmText: 'Remove',
            type: 'danger'
        });

        if (isConfirmed) {
            updateCourses(user.courses.filter(c => c !== courseToDelete));
            notify('success', 'Course removed');
        }
    };

    const handleClearData = async () => {
        const isConfirmed = await confirm({
            title: 'Reset All Data?',
            message: 'Are you sure you want to clear EVERYTHING? This includes courses, grades, tasks, and settings. This cannot be undone.',
            confirmText: 'Reset Everything',
            type: 'danger'
        });

        if (isConfirmed) {
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
                <h1 className="text-3xl font-bold text-[var(--app-text-color)] flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-gray-500" />
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your application preferences and data.</p>
            </div>

            {/* Account Section */}
            <div className="glass-panel p-8 rounded-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-[var(--app-text-color)] mb-1 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm">Manage your account and sync settings.</p>
                </div>

                {isAuthenticated && authUser ? (
                    <div className="space-y-4">
                        {/* Signed in view */}
                        <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                            {authUser.photoURL ? (
                                <img
                                    src={authUser.photoURL}
                                    alt={authUser.displayName || 'User'}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {(authUser.displayName || authUser.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-[var(--app-text-color)]">{authUser.displayName || 'User'}</p>
                                <p className="text-sm text-[var(--text-muted)]">{authUser.email}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {isSyncing ? (
                                    <span className="flex items-center gap-1 text-blue-500">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Syncing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-500">
                                        <Cloud className="w-4 h-4" />
                                        Synced
                                    </span>
                                )}
                            </div>
                        </div>

                        {lastSync && (
                            <p className="text-xs text-[var(--text-muted)]">
                                Last synced: {lastSync.toLocaleString()}
                            </p>
                        )}

                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                        >
                            {isSigningOut ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Guest view */}
                        <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/30">
                            <CloudOff className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                            <div className="flex-1">
                                <p className="font-medium text-[var(--app-text-color)]">You're using Guest Mode</p>
                                <p className="text-sm text-[var(--text-muted)]">Your data is only stored on this device. Sign in to sync across devices.</p>
                            </div>
                        </div>

                        <GoogleSignInButton onClick={handleLinkAccount} isLoading={isSigningIn} />

                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Link className="w-3 h-3" />
                            Linking will migrate your local data to the cloud
                        </p>
                    </div>
                )}
            </div>

            {/* Course Management */}
            <div className="glass-panel p-8 rounded-2xl space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-[var(--app-text-color)] mb-1">My Courses</h3>
                    <p className="text-[var(--text-muted)] text-sm">Update your semester listing.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {user?.courses.map(course => (
                        <div key={course} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-white/90 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 group shadow-sm">
                            <span className="font-bold text-[var(--app-text-color)]">{course}</span>
                            <button
                                onClick={() => handleDeleteCourse(course)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleAddCourse} className="flex gap-4">
                    <input
                        type="text"
                        value={newCourse}
                        onChange={e => setNewCourse(e.target.value)}
                        placeholder="Add new course (e.g. Physics 201)"
                        className="flex-1 bg-white/80 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-[var(--app-text-color)] placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={!newCourse.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Add
                    </button>
                </form>
            </div>

            <div className="glass-panel p-8 rounded-2xl border-l-4 border-l-red-500 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-bold text-[var(--app-text-color)]">Danger Zone</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
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
