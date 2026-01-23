import React from 'react';
import { Award, BookOpen, Layers } from 'lucide-react';

export default function GpaCalculator() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col items-center justify-center text-center py-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-300 mb-2">
                    Academic Performance
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Track your Cumulative and Semester GPA</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cumulative GPA Card */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Cumulative GPA</h3>
                    <div className="mt-4 text-6xl font-black text-gray-800 dark:text-white tracking-tighter">
                        3.85
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-500 font-medium">
                        <span className="px-2 py-1 bg-green-500/10 rounded-lg">+0.12</span>
                        <span>from last year</span>
                    </div>
                </div>

                {/* Credits Earned */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Credits Earned</h3>
                    <div className="mt-4 text-6xl font-black text-gray-800 dark:text-white tracking-tighter">
                        42
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <span>/ 120 Required</span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[35%] bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Current Semester GPA */}
                <div className="glass-panel p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl relative overflow-hidden shadow-xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <BookOpen className="w-32 h-32 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-blue-100">Spring 2026 GPA</h3>
                    <div className="mt-4 text-6xl font-black text-white tracking-tighter">
                        3.92
                    </div>
                    <div className="mt-4 text-blue-100 text-sm">
                        Projected based on current grades
                    </div>
                </div>
            </div>

            {/* Semester List */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Semester History</h2>
                <div className="space-y-4">
                    {[
                        { term: 'Spring 2026', gpa: '3.92', credits: 15, status: 'In Progress' },
                        { term: 'Fall 2025', gpa: '3.80', credits: 16, status: 'Completed' },
                        { term: 'Spring 2025', gpa: '3.75', credits: 15, status: 'Completed' },
                    ].map((sem, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-10 rounded-full ${sem.status === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{sem.term}</h4>
                                    <p className="text-xs text-gray-500">{sem.credits} Credits</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-gray-800 dark:text-white">{sem.gpa}</div>
                                <p className="text-xs text-gray-500">{sem.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
