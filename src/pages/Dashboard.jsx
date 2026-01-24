import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTasks } from '../context/TaskContext';
import { Clock, Book, TrendingUp, CheckCircle, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Helper to get friendly time (e.g. "Due in 2h 30m" or "Tomorrow at 5:00 PM")
const getTaskTimeDisplay = (dateStr, timeStr) => {
    if (!dateStr) return '';

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const userTime = timeStr || '23:59';

    // Format basic time AM/PM
    const [h, m] = userTime.split(':');
    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours % 12 || 12;
    const displayM = minutes < 10 ? '0' + minutes : minutes;
    const niceTime = `${displayH}:${displayM} ${ampm}`;

    if (dateStr === todayStr) {
        // Calculate countdown
        const due = new Date();
        due.setHours(hours, minutes, 0, 0);

        const diffMs = due - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 0) return <span className="text-red-500 font-bold">Overdue</span>;

        const hLeft = Math.floor(diffMins / 60);
        const mLeft = diffMins % 60;

        if (hLeft === 0) return <span className="text-orange-500 font-bold">Due in {mLeft}m</span>;
        return <span className="text-blue-500 font-bold">Due in {hLeft}h {mLeft}m</span>;
    }

    // If tomorrow or later
    const dateObj = new Date(dateStr + 'T00:00:00'); // simpler parsing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === tomorrowStr) return `Tomorrow, ${niceTime}`;

    // Format date nicely (e.g. "Jan 25")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(dateStr + 'T12:00:00'); // mid-day to avoid timezone offset shifts
    return `${months[d.getMonth()]} ${d.getDate()}, ${niceTime}`;
};

const TaskItem = ({ task }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/30 dark:hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className={`text-sm font-bold text-[var(--app-text-color)] dark:text-gray-200 group-hover:text-blue-600 transition-colors ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</span>
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {getTaskTimeDisplay(task.date, task.time)}
        </span>
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
    const { tasks } = useTasks();
    const [todayClasses, setTodayClasses] = useState([]);
    const [nextClass, setNextClass] = useState(null);
    const [timeUntilNext, setTimeUntilNext] = useState('');

    // Task Logic
    const pendingTasksCount = tasks.filter(t => !t.completed).length;
    const highPriorityCount = tasks.filter(t => !t.completed && t.priority === 'high').length;

    const priorityTasks = tasks
        .filter(t => !t.completed)
        .sort((a, b) => {
            // Sort by priority (high first) then date
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return new Date(a.date) - new Date(b.date);
        })
        .slice(0, 4);

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
                    value={pendingTasksCount}
                    subtext={`${highPriorityCount} High Priority`}
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
                        {priorityTasks.length > 0 ? (
                            priorityTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500">No priority tasks available.</div>
                        )}
                    </div>
                    <Link to="/todo" className="block mt-4 text-center w-full py-2 text-sm text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        View All Tasks <ArrowRight className="inline w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
