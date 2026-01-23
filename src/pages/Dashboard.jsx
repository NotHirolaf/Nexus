import React from 'react';
import { Clock, Book, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 flex items-start justify-between hover:scale-[1.02] transition-transform duration-300">
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
            <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtext}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

const TaskItem = ({ title, due, priority }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/30 dark:hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${priority === 'high' ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">{title}</span>
        </div>
        <span className="text-xs text-gray-400">{due}</span>
    </div>
);

export default function Dashboard() {
    return (
        <div className="p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Welcome back, Student
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening today.</p>
                </div>
                <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Spring Semester 2026</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Current GPA"
                    value="3.8"
                    subtext="+0.2 from last semester"
                    icon={TrendingUp}
                    colorClass="text-green-500 bg-green-500"
                />
                <StatCard
                    title="Next Class"
                    value="CS 101"
                    subtext="Starts in 45 mins"
                    icon={Book}
                    colorClass="text-blue-500 bg-blue-500"
                />
                <StatCard
                    title="Pending Tasks"
                    value="4"
                    subtext="2 due today"
                    icon={AlertCircle}
                    colorClass="text-orange-500 bg-orange-500"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Classes / Schedule Preview */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" /> Today's Schedule
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Computer Science 101</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Lecture Hall A • 10:00 AM - 11:30 AM</p>
                            </div>
                            <span className="text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">In 45m</span>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/5 border-l-4 border-gray-300 dark:border-gray-700 flex justify-between items-center opacity-70">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Calculus II</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Room 304 • 1:00 PM - 2:30 PM</p>
                            </div>
                            <span className="text-xs font-bold bg-gray-500/20 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">Later</span>
                        </div>
                    </div>
                </div>

                {/* To-Do Quick View */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> Priority Tasks
                    </h2>
                    <div className="space-y-1">
                        <TaskItem title="Submit CS Assignment" due="Today, 11:59 PM" priority="high" />
                        <TaskItem title="Read Calc Chapter 4" due="Tomorrow" priority="normal" />
                        <TaskItem title="Register for Electives" due="Fri, Jan 26" priority="high" />
                        <TaskItem title="Email Professor Smith" due="Next Week" priority="normal" />
                    </div>
                    <button className="mt-4 w-full py-2 text-sm text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        View All Tasks
                    </button>
                </div>
            </div>
        </div>
    );
}
