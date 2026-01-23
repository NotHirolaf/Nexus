import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Onboarding() {
    const { saveUser } = useUser();
    const [name, setName] = useState('');
    const [university, setUniversity] = useState('');
    const [step, setStep] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1 && name.trim()) {
            setStep(2);
        } else if (step === 2 && university.trim()) {
            saveUser(name, university);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="glass-panel max-w-md w-full p-8 rounded-3xl relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="bg-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/30">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-white mb-2">
                        Welcome to Nexus
                    </h1>
                    <p className="text-center text-blue-200 mb-8">
                        Your personal academic companion.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className={`transition-all duration-300 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full hidden'}`}>
                            <label className="block text-sm font-medium text-blue-100 mb-2">What should we call you?</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                placeholder="Enter your name"
                                autoFocus
                            />
                        </div>

                        <div className={`transition-all duration-300 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full hidden'}`}>
                            <label className="block text-sm font-medium text-blue-100 mb-2">Which university do you attend?</label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                placeholder="e.g. University of Toronto"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={step === 1 ? !name.trim() : !university.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {step === 1 ? 'Contine' : 'Get Started'} <ArrowRight className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center gap-2 mt-4">
                            <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-white' : 'bg-white/20'}`}></div>
                            <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-white' : 'bg-white/20'}`}></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
