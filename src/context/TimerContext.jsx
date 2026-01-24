import React, { createContext, useContext, useState, useEffect } from 'react';
import { Brain, Coffee, Zap } from 'lucide-react';

const TimerContext = createContext();

export const modes = {
    focus: { label: 'Focus', time: 25 * 60, color: 'text-blue-500', stroke: '#3b82f6', bg: 'bg-blue-500', icon: Brain },
    short: { label: 'Short Break', time: 5 * 60, color: 'text-green-500', stroke: '#22c55e', bg: 'bg-green-500', icon: Coffee },
    long: { label: 'Long Break', time: 15 * 60, color: 'text-purple-500', stroke: '#a855f7', bg: 'bg-purple-500', icon: Zap },
};

export function TimerProvider({ children }) {
    const [mode, setMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(modes.focus.time);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Play alarm
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const switchMode = (newMode) => {
        if (modes[newMode]) {
            setMode(newMode);
            setTimeLeft(modes[newMode].time);
            setIsActive(false);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(modes[mode].time);
    };

    return (
        <TimerContext.Provider value={{
            mode,
            timeLeft,
            isActive,
            switchMode,
            toggleTimer,
            resetTimer,
            modes
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    return useContext(TimerContext);
}
