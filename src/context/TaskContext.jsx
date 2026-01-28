import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useDataSync } from './DataSyncContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
    // Initialize from localStorage immediately
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('nexus_tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { syncData, subscribeToData, isAuthenticated } = useDataSync();
    const isLocalChange = useRef(false);
    const hasInitializedRef = useRef(false);

    // Save to localStorage immediately on every change
    useEffect(() => {
        localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Subscribe to real-time updates from Firestore
    useEffect(() => {
        if (!isAuthenticated) return;

        console.log('[TaskContext] Setting up real-time subscription');

        const unsubscribe = subscribeToData('tasks', (cloudTasks) => {
            // Only update if this wasn't triggered by our own local change
            if (!isLocalChange.current) {
                console.log('[TaskContext] Received real-time update:', cloudTasks.length, 'tasks');
                setTasks(cloudTasks);
            }
            isLocalChange.current = false;
        });

        return () => {
            console.log('[TaskContext] Cleaning up real-time subscription');
            unsubscribe();
        };
    }, [isAuthenticated, subscribeToData]);

    // Push initial local data to cloud on first auth
    useEffect(() => {
        if (isAuthenticated && !hasInitializedRef.current && tasks.length > 0) {
            console.log('[TaskContext] Pushing initial local tasks to cloud');
            syncData('tasks', tasks);
            hasInitializedRef.current = true;
        }
    }, [isAuthenticated, tasks, syncData]);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const addTask = useCallback((task) => {
        const newTask = { ...task, id: Date.now(), completed: false };
        isLocalChange.current = true;
        setTasks(prev => {
            const updated = [...prev, newTask];
            if (isAuthenticated) syncData('tasks', updated);
            return updated;
        });
    }, [isAuthenticated, syncData]);

    const toggleTask = useCallback((id) => {
        isLocalChange.current = true;
        setTasks(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
            if (isAuthenticated) syncData('tasks', updated);
            return updated;
        });
    }, [isAuthenticated, syncData]);

    const deleteTask = useCallback((id) => {
        isLocalChange.current = true;
        setTasks(prev => {
            const updated = prev.filter(t => t.id !== id);
            if (isAuthenticated) syncData('tasks', updated);
            return updated;
        });
    }, [isAuthenticated, syncData]);

    const updateTask = useCallback((id, updates) => {
        isLocalChange.current = true;
        setTasks(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
            if (isAuthenticated) syncData('tasks', updated);
            return updated;
        });
    }, [isAuthenticated, syncData]);

    return (
        <TaskContext.Provider value={{ tasks, isLoading, addTask, toggleTask, deleteTask, updateTask, currentTime }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}

