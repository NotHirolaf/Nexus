import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

export default function Pomodoro() {
    const { mode, timeLeft, isActive, switchMode, toggleTimer, resetTimer, modes, customDuration, updateCustomDuration } = useTimer();

    // For calculating progress ring
    // For calculating progress ring
    // For calculating progress ring
    const totalTime = mode === 'custom' ? customDuration : modes[mode].time;
    // For stopwatch, show full ring (progress 100%) or empty (0%). Let's go with full ring for active look.
    const progress = mode === 'stopwatch' ? 100 : ((totalTime - timeLeft) / totalTime) * 100;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const CurrentIcon = modes[mode].icon;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4">
            <div className="glass-panel p-8 md:p-12 rounded-3xl flex flex-col items-center max-w-2xl w-full relative overflow-hidden transition-all duration-500">
                {/* Background Glow */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent ${modes[mode].bg} to-transparent opacity-50`} />

                {/* Mode Switcher */}
                <div className="flex gap-2 mb-10 bg-slate-100 dark:bg-black/20 p-1 rounded-2xl relative z-10">
                    {Object.keys(modes).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${mode === m
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            {modes[m].label}
                        </button>
                    ))}
                </div>

                {/* Circular Timer */}
                <div className="relative mb-10 group">
                    <svg className="transform -rotate-90 w-72 h-72 md:w-80 md:h-80 drop-shadow-2xl">
                        {/* Background Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-200 dark:text-slate-800 transition-colors duration-500"
                        />
                        {/* Progress Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke={modes[mode].stroke}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    {/* Time Display */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
                        <div className={`text-6xl md:text-7xl font-bold font-mono tracking-tighter ${modes[mode].color} transition-colors duration-500`}>
                            {formatTime(timeLeft)}
                        </div>

                        {/* Custom Duration Input */}
                        {!isActive && mode === 'custom' && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <div className="flex flex-col items-center">
                                    <label className="text-[10px] uppercase text-slate-400 font-bold mb-1">Min</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={Math.floor(customDuration / 60)}
                                        onChange={(e) => {
                                            const mins = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                            const secs = customDuration % 60;
                                            updateCustomDuration(mins * 60 + secs);
                                        }}
                                        className="w-16 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-center font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <span className="text-xl font-bold text-slate-300 dark:text-slate-600 mt-4">:</span>
                                <div className="flex flex-col items-center">
                                    <label className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sec</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={customDuration % 60}
                                        onChange={(e) => {
                                            const mins = Math.floor(customDuration / 60);
                                            const secs = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                            updateCustomDuration(mins * 60 + secs);
                                        }}
                                        className="w-16 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-center font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-medium">
                            <CurrentIcon size={18} className="animate-pulse" />
                            <span className="uppercase tracking-widest text-xs">{isActive ? 'Running' : 'Paused'}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-6 z-10">
                    <button
                        onClick={toggleTimer}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-95 transition-all duration-300 hover:shadow-xl ${modes[mode].bg}`}
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-md transform active:scale-95 transition-all duration-300"
                    >
                        <RotateCcw size={28} />
                    </button>
                </div>
            </div>
        </div>
    );
}
