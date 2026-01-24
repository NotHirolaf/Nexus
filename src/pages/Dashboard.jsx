import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Clock, Book, TrendingUp, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 flex items-start justify-between hover:scale-[1.02] transition-transform duration-300">
        <div>
            <h3 className="text-sm font-bold text-[var(--app-text-color)] dark:text-gray-400 mb-1">{title}</h3>
            <div className="text-3xl font-bold text-[var(--app-text-color)] dark:text-white mb-2">{value}</div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-500">{subtext}</p>
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
            <span className="text-sm font-bold text-[var(--app-text-color)] dark:text-gray-200 group-hover:text-blue-600 transition-colors">{title}</span>
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{due}</span>
    </div>
);

// Helper to format decimal time (e.g., 10.5 -> "10:30 AM")
const formatTime = (decimalTime) => {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
};

export default function Dashboard() {
    const { user } = useUser();
    const [todayClasses, setTodayClasses] = useState([]);
    const [nextClass, setNextClass] = useState(null);
    const [timeUntilNext, setTimeUntilNext] = useState('');

    useEffect(() => {
        // Load schedule from localStorage
        const loadSchedule = () => {
            const saved = localStorage.getItem('nexus_timetable');
            if (!saved) return;

            const schedule = JSON.parse(saved);
            const now = new Date();
            let currentDayIndex = now.getDay() - 1; // 0=Mon, 4=Fri. (Sunday=-1, Sat=5)

            // If it's weekend, maybe show Monday's classes? Or just say "No classes today"
            // For now, let's strict to "Today"

            const daysClasses = schedule
                .filter(c => c.dayIndex === currentDayIndex)
                .sort((a, b) => a.startTime - b.startTime);

            setTodayClasses(daysClasses);

            // Find Next Class
            const currentDecimalTime = now.getHours() + now.getMinutes() / 60;

            // Allow showing classes that are currently running?
            // "Next" usually means starting in the future.
            // Let's find the first class that hasn't ended yet?
            // Or strictly "starts in the future".

            const upcoming = daysClasses.find(c => c.startTime > currentDecimalTime);

            if (upcoming) {
                setNextClass(upcoming);
                const diffHours = upcoming.startTime - currentDecimalTime;
                const diffMins = Math.round(diffHours * 60);

                if (diffMins < 60) {
                    setTimeUntilNext(`Starts in ${diffMins} mins`);
                } else {
                    const h = Math.floor(diffMins / 60);
                    const m = diffMins % 60;
                    setTimeUntilNext(`Starts in ${h}h ${m}m`);
                }
            } else {
                setNextClass(null);
                setTimeUntilNext('No more classes today');
            }
        };

        loadSchedule();
        const interval = setInterval(loadSchedule, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-2 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Welcome back, {user?.name || 'Student'}
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
                    value={nextClass ? nextClass.name : "Free Time"}
                    subtext={nextClass ? timeUntilNext : "No upcoming classes"}
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
                    <h2 className="text-xl font-bold text-[var(--app-text-color)] dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" /> Today's Schedule
                    </h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {todayClasses.length > 0 ? (
                            todayClasses.map((cl, idx) => {
                                const isNext = nextClass && nextClass.id === cl.id;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl flex justify-between items-center transition-all ${isNext
                                            ? 'bg-blue-500/10 border-l-4 border-blue-500 shadow-sm'
                                            : 'bg-gray-100/50 dark:bg-white/5 border-l-4 border-transparent opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <div>
                                            <h3 className="font-bold text-[var(--app-text-color)] dark:text-gray-100">{cl.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {cl.room} • {formatTime(cl.startTime)} - {formatTime(cl.startTime + cl.duration)}
                                            </p>
                                        </div>
                                        {isNext && (
                                            <span className="text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">
                                                Next
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 opacity-60">
                                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No classes scheduled for today.</p>
                                <p className="text-xs text-gray-400">Enjoy your free day!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* To-Do Quick View */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-[var(--app-text-color)] dark:text-white mb-4 flex items-center gap-2">
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
