import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useTasks } from '../context/TaskContext';
import { Clock, Book, TrendingUp, CheckCircle, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 flex items-start justify-between hover:scale-[1.02] transition-transform duration-300">
        <div>
            <h3 className="text-sm font-bold text-[var(--text-muted)] mb-1">{title}</h3>
            <div className="text-3xl font-bold text-[var(--app-text-color)] mb-2">{value}</div>
            <p className="text-xs font-medium text-[var(--text-muted)]">{subtext}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

// Helper to get friendly time (e.g. "Due in 2h 30m" or "Tomorrow at 5:00 PM")
// Helper to get friendly time (e.g. "Due in 2h 30m" or "Tomorrow at 5:00 PM")
const getTaskTimeDisplay = (dateStr, timeStr, now = new Date()) => {
    if (!dateStr) return '';

    const userTime = timeStr || '23:59';
    const [h, m] = userTime.split(':');
    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);

    // Construct due date object (handle YYYY-MM-DD properly with time)
    const due = new Date(`${dateStr}T${userTime}:00`);

    const diffMs = due - now;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return <span className="text-red-500 font-bold">Overdue</span>;

    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        if (diffDays === 1) return <span className="text-blue-500 font-bold">Due in 1 day</span>;
        return <span className="text-blue-500 font-bold">Due in {diffDays} days</span>;
    }

    if (diffHours > 0) {
        const mLeft = diffMins % 60;
        return <span className="text-blue-500 font-bold">Due in {diffHours}h {mLeft}m</span>;
    }

    return <span className="text-orange-500 font-bold">Due in {diffMins}m</span>;
};

const TaskItem = ({ task }) => {
    const { currentTime } = useTasks();
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/30 dark:hover:bg-white/5 transition-colors group cursor-pointer border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className={`text-sm font-bold text-[var(--app-text-color)] group-hover:text-blue-600 transition-colors ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</span>
            </div>
            <span className="text-xs font-bold text-[var(--text-muted)]">
                {getTaskTimeDisplay(task.date, task.time, currentTime)}
            </span>
        </div>
    );
};

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
    const { tasks, currentTime } = useTasks();
    const [schedule, setSchedule] = useState([]);
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

    // Load schedule once on mount
    useEffect(() => {
        const saved = localStorage.getItem('nexus_timetable');
        if (saved) {
            setSchedule(JSON.parse(saved));
        }
    }, []);

    // Update schedule view whenever currentTime or schedule (data) changes
    useEffect(() => {
        if (!schedule.length) return;

        // Use currentTime from context instead of new Date()
        const now = currentTime || new Date();
        let currentDayIndex = now.getDay() - 1; // 0=Mon, 4=Fri. (Sunday=-1, Sat=5)

        const daysClasses = schedule
            .filter(c => c.dayIndex === currentDayIndex)
            .sort((a, b) => a.startTime - b.startTime);

        setTodayClasses(daysClasses);

        // Find Next Class
        const currentDecimalTime = now.getHours() + now.getMinutes() / 60;

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
    }, [currentTime, schedule]);

    // Calculate cGPA
    const semesters = user?.semesters || [];
    const totalCredits = semesters.reduce((sum, s) => sum + parseFloat(s.credits), 0);
    const weightedSum = semesters.reduce((sum, s) => sum + (parseFloat(s.credits) * parseFloat(s.gpa)), 0);
    const cGPA = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00";

    return (
        <div className="p-2 md:p-6 space-y-6">
            <div className="flex justify-between items-center dashboard-banner p-6 rounded-2xl border border-blue-200/50 dark:border-white/10 shadow-lg shadow-blue-500/5 dark:shadow-none transition-all">
                <div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
                        Hello, {user?.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-sm font-bold mt-1">Welcome back to your workspace</p>
                </div>
                <div className="glass px-5 py-3 rounded-full flex items-center gap-2 text-sm font-bold text-[var(--app-text-color)] shadow-sm border border-white/50">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                    <span>Winter Semester 2026</span>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Current GPA"
                    value={cGPA}
                    subtext="Cumulative GPA"
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
                    <h2 className="text-xl font-bold text-[var(--app-text-color)] mb-4 flex items-center gap-2">
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
                                            <h3 className="font-bold text-[var(--app-text-color)]">{cl.name}</h3>
                                            <p className="text-sm text-[var(--text-muted)]">
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
                    <h2 className="text-xl font-bold text-[var(--app-text-color)] mb-4 flex items-center gap-2">
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
