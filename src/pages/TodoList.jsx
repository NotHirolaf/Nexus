import React, { useState } from 'react';
import { CheckSquare, Plus, Trash, Calendar, Tag, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

// Helper to format time to AM/PM
const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m < 10 ? '0' + m : m;
    return `${displayH}:${displayM} ${ampm}`;
};

const TodoItem = ({ task, onToggle, onDelete }) => (
    <div className={`group flex items-center gap-4 p-4 rounded-xl border border-white/20 transition-all duration-300 ${task.completed ? 'bg-white/5 opacity-60' : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10'}`}>
        <button
            onClick={() => onToggle(task.id)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-blue-500'}`}
        >
            {task.completed && <CheckSquare className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1">
            <p className={`font-medium text-black dark:text-gray-200 ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
            <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-500">
                    <Calendar className="w-3 h-3" /> {task.date} {task.time ? `at ${formatTimeAMPM(task.time)}` : ''}
                </span>
                {task.tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-opacity-20 ${task.tag === 'School' ? 'text-blue-500 bg-blue-500' :
                            'text-purple-500 bg-purple-500'
                        }`}>
                        {task.tag}
                    </span>
                )}
                {task.priority === 'high' && !task.completed && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-red-500 bg-red-500 bg-opacity-20">
                        High Priority
                    </span>
                )}
            </div>
        </div>
        <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10"
        >
            <Trash className="w-4 h-4" />
        </button>
    </div>
);

export default function TodoList() {
    const { tasks, addTask, toggleTask, deleteTask } = useTasks();
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New task state
    const [newTask, setNewTask] = useState({ title: '', date: '', time: '23:59', tag: 'Personal', priority: 'normal' });

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.title) return;
        addTask(newTask);
        setNewTask({ title: '', date: '', time: '23:59', tag: 'Personal', priority: 'normal' });
        setIsModalOpen(false);
    }
    // ... existing filter logic ...

    const filteredTasks = tasks.filter(t => {
        if (filter === 'completed') return t.completed;
        if (filter === 'upcoming') return !t.completed && new Date(t.date) > new Date();
        if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return !t.completed && t.date === today;
        }
        return true;
    }).sort((a, b) => Number(a.completed) - Number(b.completed)); // Incomplete first

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 relative">
            {/* Sidebar / Filters */}
            <div className="w-full md:w-64 space-y-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all"
                >
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="w-3 h-3 rounded-full bg-blue-500"></span> School</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Personal</div>
                    </div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-black dark:text-white">Tasks</h2>
                    <span className="text-sm text-black dark:text-gray-500">{filteredTasks.length} items</span>
                </div>

                <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">No tasks found</div>
                    ) : (
                        filteredTasks.map(task => (
                            <TodoItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                        ))
                    )}
                </div>
            </div>

            {/* Add Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Add New Task</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full bg-gray-100 dark:bg-black/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="e.g. Study for Finals"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-100 dark:bg-black/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={newTask.date}
                                        onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-gray-100 dark:bg-black/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={newTask.time}
                                        onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">Category</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { label: 'Personal', color: 'bg-purple-500', text: 'text-purple-500' },
                                        { label: 'School', color: 'bg-blue-500', text: 'text-blue-500' }
                                    ].map(cat => (
                                        <button
                                            key={cat.label}
                                            type="button"
                                            onClick={() => setNewTask({ ...newTask, tag: cat.label })}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${newTask.tag === cat.label
                                                    ? `${cat.color} text-white border-transparent shadow-md transform scale-105`
                                                    : `bg-transparent ${cat.text} border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5`
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-1">Priority</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="priority"
                                            value="normal"
                                            checked={newTask.priority === 'normal'}
                                            onChange={() => setNewTask({ ...newTask, priority: 'normal' })}
                                            className="text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Normal</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="priority"
                                            value="high"
                                            checked={newTask.priority === 'high'}
                                            onChange={() => setNewTask({ ...newTask, priority: 'high' })}
                                            className="text-red-500 focus:ring-red-500"
                                        />
                                        <span className="text-red-500 font-bold">High Priority</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4">
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
