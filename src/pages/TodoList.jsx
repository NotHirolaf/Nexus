import React, { useState } from 'react';
import { CheckSquare, Plus, Trash, Calendar, Tag } from 'lucide-react';

const TodoItem = ({ text, date, tag, color, done }) => (
    <div className={`group flex items-center gap-4 p-4 rounded-xl border border-white/20 transition-all duration-300 ${done ? 'bg-white/5 opacity-60' : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10'}`}>
        <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-blue-500'}`}>
            {done && <CheckSquare className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1">
            <p className={`font-medium text-black dark:text-gray-200 ${done ? 'line-through text-gray-500' : ''}`}>{text}</p>
            <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-500">
                    <Calendar className="w-3 h-3" /> {date}
                </span>
                {tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color} bg-opacity-20`}>
                        {tag}
                    </span>
                )}
            </div>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10">
            <Trash className="w-4 h-4" />
        </button>
    </div>
);

export default function TodoList() {
    const [filter, setFilter] = useState('all');

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            {/* Sidebar / Filters */}
            <div className="w-full md:w-64 space-y-4">
                <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-5 h-5" /> New Task
                </button>

                <div className="glass-panel p-2 rounded-xl">
                    {['all', 'today', 'upcoming', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors capitalized ${filter === f ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'text-black dark:text-gray-400 hover:bg-white/5'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="glass-card p-4">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">Categories</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="w-3 h-3 rounded-full bg-red-500"></span> Urgent</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="w-3 h-3 rounded-full bg-blue-500"></span> School</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Personal</div>
                    </div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-black dark:text-white">Tasks</h2>
                    <span className="text-sm text-black dark:text-gray-500">5 items</span>
                </div>

                <div className="space-y-3">
                    <TodoItem text="CS 101 Final Project" date="Feb 28" tag="School" color="text-blue-500 bg-blue-500" done={false} />
                    <TodoItem text="Apply for Internship" date="Jan 30" tag="Personal" color="text-purple-500 bg-purple-500" done={false} />
                    <TodoItem text="Buy Groceries" date="Tomorrow" tag="Personal" color="text-purple-500 bg-purple-500" done={true} />
                    <TodoItem text="Calculus Quiz Prep" date="Today" tag="School" color="text-blue-500 bg-blue-500" done={false} />
                    <TodoItem text="Call Parents" date="Sunday" tag="Personal" color="text-green-500 bg-green-500" done={false} />
                </div>
            </div>
        </div>
    );
}
