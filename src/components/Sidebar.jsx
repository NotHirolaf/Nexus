import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Calculator, GraduationCap, CheckSquare, Sun, Moon, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { cn } from '../lib/utils';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useUser();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Timetable', path: '/timetable', icon: Calendar },
        { name: 'Grade Calc', path: '/grades', icon: Calculator },
        { name: 'GPA Calc', path: '/gpa', icon: GraduationCap },
        { name: 'To-Do List', path: '/todo', icon: CheckSquare },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen p-4 sticky top-0">
            <div className="glass-panel flex-1 rounded-3xl flex flex-col overflow-hidden relative">
                {/* Brand */}
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <img
                        src="/uoft-logo.png"
                        alt="UofT Logo"
                        className="w-10 h-10 object-contain drop-shadow-md"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-none truncate max-w-[140px]">{user?.university || 'University'}</span>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#002A5C] to-[#2B548A] dark:from-sky-300 dark:to-white">
                            Nexus
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-500/30"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-blue-300"
                                )
                            }
                        >
                            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / Theme Toggle */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-blue-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-500" />
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
