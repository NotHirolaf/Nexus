import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Onboarding() {
    const { saveUser } = useUser();
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [university, setUniversity] = useState('');
    const [credits, setCredits] = useState('');
    const [courses, setCourses] = useState('');
    const [step, setStep] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1 && name.trim()) {
            setStep(2);
        } else if (step === 2 && university.trim()) {
            setStep(3);
        } else if (step === 3 && credits.trim()) {
            setStep(4);
        } else if (step === 4 && courses.trim()) {
            const courseList = courses.split(',').map(c => c.trim()).filter(Boolean);
            saveUser(name, university, parseFloat(credits) || 0, courseList);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark'
                ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
                : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
            }`}>
            <div className={`max-w-md w-full p-8 rounded-3xl relative overflow-hidden transition-all duration-300 ${theme === 'dark'
                    ? 'glass-panel border-white/10'
                    : 'bg-white/80 backdrop-blur-xl border border-white shadow-xl'
                }`}>
                {/* Decorative background elements */}
                <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
                    }`}></div>
                <div className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Name */}
                        <div className={`transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full hidden'}`}>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-100' : 'text-slate-700'
                                }`}>What should we call you?</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                }`}>Current Courses (comma separated)</label>
                            <input
                                type="text"
                                value={courses}
                                onChange={(e) => setCourses(e.target.value)}
                                className={`w-full border rounded-xl px-4 py-3 placeholder-opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${theme === 'dark'
                                        ? 'bg-white/10 border-white/20 text-white placeholder-blue-300'
                                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                                    }`}
                                placeholder="e.g. CS101, MAT137, PSY100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={
                                (step === 1 && !name.trim()) ||
                                (step === 2 && !university.trim()) ||
                                (step === 3 && !credits.trim()) ||
                                (step === 4 && !courses.trim())
                            }
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {step === 4 ? 'Get Started' : 'Continue'} <ArrowRight className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center gap-2 mt-4">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className={`w-2 h-2 rounded-full transition-colors ${step >= s
                                        ? (theme === 'dark' ? 'bg-white' : 'bg-blue-600')
                                        : (theme === 'dark' ? 'bg-white/20' : 'bg-slate-300')
                                    }`}></div>
                            ))}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
