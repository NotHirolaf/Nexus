import React, { createContext, useContext, useState, useEffect } from 'react';
import { Brain, Coffee, Zap, Timer, Settings } from 'lucide-react';

const TimerContext = createContext();

export const modes = {
    focus: { label: 'Focus', time: 25 * 60, color: 'text-blue-500', stroke: '#3b82f6', bg: 'bg-blue-500', icon: Brain },
    short: { label: 'Short Break', time: 5 * 60, color: 'text-green-500', stroke: '#22c55e', bg: 'bg-green-500', icon: Coffee },
    long: { label: 'Long Break', time: 15 * 60, color: 'text-purple-500', stroke: '#a855f7', bg: 'bg-purple-500', icon: Zap },
    custom: { label: 'Custom', time: 30 * 60, color: 'text-cyan-500', stroke: '#06b6d4', bg: 'bg-cyan-500', icon: Settings },
    stopwatch: { label: 'Stopwatch', time: 0, color: 'text-orange-500', stroke: '#f97316', bg: 'bg-orange-500', icon: Timer },
};

export function TimerProvider({ children }) {
    const [mode, setMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(modes.focus.time);
    const [isActive, setIsActive] = useState(false);
    const [customDuration, setCustomDuration] = useState(30 * 60); // in seconds now

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (mode === 'stopwatch') {
                    setTimeLeft((prev) => prev + 1);
                } else if (timeLeft > 0) {
                    setTimeLeft((prev) => prev - 1);
                } else {
                    // Timer finished (only for countdown modes)
                    setIsActive(false);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(e => console.log('Audio play failed:', e));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const switchMode = (newMode) => {
        if (modes[newMode]) {
            setMode(newMode);
            if (newMode === 'custom') {
                setTimeLeft(customDuration);
            } else {
                setTimeLeft(modes[newMode].time);
            }
            setIsActive(false);
        }
    };

    const updateCustomDuration = (seconds) => {
        setCustomDuration(seconds);
        if (mode === 'custom') {
            setTimeLeft(seconds);
            setIsActive(false);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'custom') {
            setTimeLeft(customDuration);
        } else {
            setTimeLeft(modes[mode].time);
        }
    };

    return (
        <TimerContext.Provider value={{
            mode,
            timeLeft,
            isActive,
            switchMode,
            toggleTimer,
            resetTimer,
            modes,
            customDuration,
            updateCustomDuration
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    return useContext(TimerContext);
}
