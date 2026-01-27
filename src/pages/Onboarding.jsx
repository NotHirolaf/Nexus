import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, ArrowLeft, BookOpen, Plus, X, Cloud } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Onboarding() {
    const { saveUser } = useUser();
    const { theme } = useTheme();
    const { signInWithGoogle, isAuthenticated, user: authUser, isLoading: authLoading } = useAuth();
    const [name, setName] = useState('');
    const [university, setUniversity] = useState('');
    const [credits, setCredits] = useState('');
    const [courses, setCourses] = useState([]);
    const [currentCourse, setCurrentCourse] = useState('');
    const [step, setStep] = useState(0); // Start at step 0 (sign-in options)
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [signInError, setSignInError] = useState(null);

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        setSignInError(null);
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                // After successful sign-in, go to step 1 (name)
                // Pre-fill name from Google account if available
                if (result.user?.displayName) {
                    setName(result.user.displayName);
                }
                setStep(1);
            } else {
                setSignInError(result.error || 'Sign in failed');
            }
        } catch (error) {
            setSignInError(error.message);
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleContinueAsGuest = () => {
        setStep(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1 && name.trim()) {
            setStep(2);
        } else if (step === 2 && university.trim()) {
            setStep(3);
        } else if (step === 3 && credits.trim()) {
            setStep(4);
        } else if (step === 4) {
            // Add any remaining text in the input as a course
            let finalCourses = [...courses];
            if (currentCourse.trim()) {
                finalCourses.push(currentCourse.trim());
            }
            // Only proceed if we have at least one course (optional check, remove if not needed)
            if (finalCourses.length > 0) {
                saveUser(name, university, parseFloat(credits) || 0, finalCourses);
            }
        }
    };

    const addCourse = (e) => {
        e.preventDefault();
        if (currentCourse.trim()) {
            setCourses([...courses, currentCourse.trim()]);
            setCurrentCourse('');
        }
    };

    const removeCourse = (index) => {
        setCourses(courses.filter((_, i) => i !== index));
    };

    const handleBack = () => {
        if (step > 0) {
            setStep((prev) => prev - 1);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
            : 'bg-gradient-to-br from-blue-100 via-blue-50 to-white'
            }`}>
            <div className={`max-w-md w-full p-8 rounded-3xl relative overflow-hidden transition-all duration-300 glass-panel ${theme === 'dark' ? 'border-white/10' : 'border-white/40'
                }`}>
                {/* Decorative background elements */}
                <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
                    }`}></div>
                <div className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'
                    }`}></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h1 className={`text-3xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'
                        }`}>
                        Welcome to Nexus
                    </h1>
                    <p className={`text-center mb-8 ${theme === 'dark' ? 'text-blue-200' : 'text-slate-500'
                        }`}>
                        Your personal academic companion.
                    </p>

                    <form className="space-y-6">
                        {/* Step 0: Sign-in options */}
                        <div className={`transition-all duration-300 ${step === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full hidden'}`}>
                            <div className="space-y-4">
                                <GoogleSignInButton
                                    onClick={handleGoogleSignIn}
                                    isLoading={isSigningIn || authLoading}
                                />

                                {signInError && (
                                    <p className="text-red-400 text-sm text-center">{signInError}</p>
                                )}

                                <div className="flex items-center gap-4 my-6">
                                    <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'}`}></div>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>or</span>
                                    <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'}`}></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleContinueAsGuest}
                                    className={`w-full px-6 py-3.5 rounded-xl font-medium transition-all ${theme === 'dark'
                                        ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                        }`}
                                >
                                    Continue as Guest
                                </button>

                                <p className={`text-xs text-center mt-4 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                                    <Cloud className="w-3 h-3 inline mr-1" />
                                    Sign in to sync your data across devices
                                </p>
                            </div>
                        </div>

                        {/* Step 1: Name */}
                        <div className={`transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full hidden'}`}>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-100' : 'text-slate-700'
                                }`}>What should we call you?</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                className={`w-full border rounded-xl px-4 py-3 placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${theme === 'dark'
                                    ? 'bg-white/10 border-white/20 text-white placeholder-blue-300'
                                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                                    }`}
                                placeholder="Enter your name"
                                autoFocus
                            />
                        </div>

                        {/* Step 2: University */}
                        <div className={`transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full hidden'}`}>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-100' : 'text-slate-700'
                                }`}>Which university do you attend?</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                className={`w-full border rounded-xl px-4 py-3 placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${theme === 'dark'
                                    ? 'bg-white/10 border-white/20 text-white placeholder-blue-300'
                                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                                    }`}
                                placeholder="e.g. University of Toronto"
                            />
                        </div>

                        {/* Step 3: Credits */}
                        <div className={`transition-all duration-300 ${step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full hidden'}`}>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-100' : 'text-slate-700'
                                }`}>Current Credits Earned</label>
                            <input
                                type="number"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                className={`w-full border rounded-xl px-4 py-3 placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${theme === 'dark'
                                    ? 'bg-white/10 border-white/20 text-white placeholder-blue-300'
                                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                                    }`}
                                placeholder="e.g. 12.5"
                                min="0"
                                step="0.5"
                            />
                        </div>

                        {/* Step 4: Courses */}
                        <div className={`transition-all duration-300 ${step === 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full hidden'}`}>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-100' : 'text-slate-700'
                                }`}>Add your current courses</label>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={currentCourse}
                                    onChange={(e) => setCurrentCourse(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCourse(e);
                                        }
                                    }}
                                    className={`flex-1 border rounded-xl px-4 py-3 placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${theme === 'dark'
                                        ? 'bg-white/10 border-white/20 text-white placeholder-blue-300'
                                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                                        }`}
                                    placeholder="e.g. CS101"
                                />
                                <button
                                    onClick={addCourse}
                                    className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {courses.map((course, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium animate-fadeIn ${theme === 'dark'
                                            ? 'bg-white/10 text-blue-100 border border-white/10'
                                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                                            }`}
                                    >
                                        {course}
                                        <button
                                            onClick={() => removeCourse(index)}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {courses.length === 0 && (
                                    <span className={`text-sm italic ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>
                                        Added courses will appear here...
                                    </span>
                                )}
                            </div>
                        </div>

                        {step > 0 && (
                            <div className="flex gap-3">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme === 'dark'
                                            ? 'bg-white/10 hover:bg-white/20 text-white'
                                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                            }`}
                                    >
                                        <ArrowLeft className="w-5 h-5" /> Back
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={
                                        (step === 1 && !name.trim()) ||
                                        (step === 2 && !university.trim()) ||
                                        (step === 3 && !credits.trim()) ||
                                        (step === 4 && courses.length === 0 && !currentCourse.trim())
                                    }
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {step === 4 ? 'Get Started' : 'Continue'} <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {step > 0 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {[1, 2, 3, 4].map((s) => (
                                    <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step >= s
                                        ? (theme === 'dark' ? 'bg-white' : 'bg-blue-600')
                                        : (theme === 'dark' ? 'bg-white/20' : 'bg-slate-300')
                                        }`}></div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
