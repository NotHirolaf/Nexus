import React, { useState } from 'react';
import { Plus, Calculator, Trash2 } from 'lucide-react';

const GradeRow = ({ name, weight, score }) => (
    <div className="flex items-center gap-4 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/5">
        <input
            type="text"
            defaultValue={name}
            className="flex-1 bg-transparent border-none outline-none font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400"
            placeholder="Assessment Name"
        />
        <div className="flex items-center gap-2">
            <input
                type="number"
                defaultValue={weight}
                className="w-16 bg-white/50 dark:bg-black/20 rounded-lg px-2 py-1 text-center text-sm"
                placeholder="Wt %"
            />
            <span className="text-gray-400 text-xs">%</span>
        </div>
        <div className="flex items-center gap-2">
            <input
                type="number"
                defaultValue={score}
                className="w-16 bg-white/50 dark:bg-black/20 rounded-lg px-2 py-1 text-center text-sm"
                placeholder="Score"
            />
            <span className="text-gray-400 text-xs">/100</span>
        </div>
        <button className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);

export default function GradeCalculator() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Grade Calculator</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Calculate your course grade based on weighted assessments.</p>
                </div>
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 bg-blue-500 text-white shadow-lg border-0">
                    <span className="text-sm font-medium opacity-80">Projected Grade</span>
                    <span className="text-2xl font-bold">A-</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Calculator */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Assessments</h2>
                        <button className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        <GradeRow name="Midterm Exam" weight="30" score="88" />
                        <GradeRow name="Final Project" weight="40" score="92" />
                        <GradeRow name="Quiz 1" weight="10" score="95" />
                        <GradeRow name="Homework" weight="20" score="100" />
                    </div>

                    <div className="pt-6 border-t border-gray-200/50 dark:border-white/10 mt-6 flex justify-end">
                        <button className="glass bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30 transition-all">
                            <Calculator className="w-5 h-5" /> Calculate Grade
                        </button>
                    </div>
                </div>

                {/* Course Info / Stats */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Course Info</h3>
                        <select className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option>CS 101 - Intro to CS</option>
                            <option>MATH 202 - Calculus II</option>
                            <option>PHYS 101 - General Physics</option>
                        </select>
                    </div>

                    <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 rounded-full border-8 border-blue-500/20 border-t-blue-500 flex items-center justify-center mb-4">
                            <div className="text-3xl font-bold text-gray-800 dark:text-white">92.4%</div>
                        </div>
                        <p className="text-sm text-gray-500">You need <span className="text-blue-500 font-bold">94%</span> on final to get an A</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
