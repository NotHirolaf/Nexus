import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Layers, Plus, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';

export default function GpaCalculator() {
    const { user, updateSemesters } = useUser();
    const { notify, confirm } = useNotification();
    const semesters = user?.semesters || [];

    // New Semester State
    const [newSem, setNewSem] = useState({
        year: '2026',
        term: 'Winter',
        gpa: '',
        credits: ''
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newSem.gpa || !newSem.credits) {
            notify('warning', 'Please fill in all fields');
            return;
        }

        const gpa = parseFloat(newSem.gpa);
        const credits = parseFloat(newSem.credits);

        if (isNaN(gpa) || isNaN(credits)) {
            notify('error', 'Invalid GPA or credits value');
            return;
        }

        // Prevent duplicate semesters
        if (semesters.some(s => s.year == newSem.year && s.term === newSem.term)) {
            notify('error', `Semester already exists: ${newSem.term} ${newSem.year}`, 4000);
            return;
        }

        updateSemesters([
            { ...newSem, gpa: gpa.toFixed(2), credits: credits, id: Date.now() },
            ...semesters
        ]);

        notify('success', 'Semester added successfully');
        setNewSem({ ...newSem, gpa: '', credits: '' });
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Delete Semester?',
            message: 'Are you sure you want to remove this semester? This will affect your cumulative GPA calculation.',
            confirmText: 'Delete',
            type: 'danger'
        });

        if (isConfirmed) {
            updateSemesters(semesters.filter(s => s.id !== id));
            notify('success', 'Semester removed');
        }
    };

    // Calculate Stats
    const totalCredits = semesters.reduce((sum, s) => sum + parseFloat(s.credits), 0);
    const weightedSum = semesters.reduce((sum, s) => sum + (parseFloat(s.credits) * parseFloat(s.gpa)), 0);
    const cGPA = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00";

    // UofT Requirement: 20.0 credits
    const progress = Math.min((totalCredits / 20.0) * 100, 100);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col items-center justify-center text-center py-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-300 mb-2">
                    Academic Performance
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Track your Cumulative GPA (UofT Standard)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cumulative GPA Card */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Cumulative GPA</h3>
                    <div className="mt-4 text-6xl font-black text-gray-800 dark:text-white tracking-tighter">
                        {cGPA}
                    </div>
                    <div className="mt-4 text-sm text-green-500 font-medium">
                        Based on {semesters.length} semesters
                    </div>
                </div>

                {/* Credits Earned */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Credits Earned</h3>
                    <div className="mt-4 text-6xl font-black text-gray-800 dark:text-white tracking-tighter">
                        {totalCredits}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <span>/ 20.0 Required</span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Input Form */}
                <div className="glass-panel p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl shadow-xl shadow-blue-500/20">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5" /> Add Semester</h3>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs opacity-70 mb-1 block">Year</label>
                                <input
                                    type="number"
                                    value={newSem.year}
                                    onChange={e => setNewSem({ ...newSem, year: e.target.value })}
                                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 outline-none focus:bg-white/30 transition-all text-white placeholder-white/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs opacity-70 mb-1 block">Term</label>
                                <select
                                    value={newSem.term}
                                    onChange={e => setNewSem({ ...newSem, term: e.target.value })}
                                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 outline-none focus:bg-white/30 transition-all text-white [&>option]:text-black"
                                >
                                    <option value="Fall">Fall</option>
                                    <option value="Winter">Winter</option>
                                    <option value="Summer">Summer</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs opacity-70 mb-1 block">GPA</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="4.0"
                                    value={newSem.gpa}
                                    onChange={e => setNewSem({ ...newSem, gpa: e.target.value })}
                                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 outline-none focus:bg-white/30 transition-all text-white placeholder-white/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs opacity-70 mb-1 block">Credits</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    placeholder="2.5"
                                    value={newSem.credits}
                                    onChange={e => setNewSem({ ...newSem, credits: e.target.value })}
                                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 outline-none focus:bg-white/30 transition-all text-white placeholder-white/50"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-2 bg-white text-blue-600 font-bold rounded-xl mt-2 hover:bg-white/90 transition-colors">
                            Add Result
                        </button>
                    </form>
                </div>
            </div>

            {/* Semester List */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Semester History</h2>
                {semesters.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No semester data added yet.</div>
                ) : (
                    <div className="space-y-4">
                        {semesters.map((sem) => (
                            <div key={sem.id} className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 hover:bg-white/60 dark:hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-10 rounded-full bg-blue-500"></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white">{sem.term} {sem.year}</h4>
                                        <p className="text-xs text-gray-500">{sem.credits} Credits</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-gray-800 dark:text-white">{sem.gpa}</div>
                                        <p className="text-xs text-gray-500">GPA</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(sem.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
