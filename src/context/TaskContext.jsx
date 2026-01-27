import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDataSync } from './DataSyncContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { loadData, syncData, isAuthenticated } = useDataSync();

    // Load tasks on mount and when auth state changes
    useEffect(() => {
        const loadTasks = async () => {
            setIsLoading(true);
            try {
                const savedTasks = await loadData('tasks');
                setTasks(savedTasks || []);
            } catch (error) {
                console.error('Error loading tasks:', error);
                const local = localStorage.getItem('nexus_tasks');
                setTasks(local ? JSON.parse(local) : []);
            } finally {
                setIsLoading(false);
            }
        };
        loadTasks();
    }, [loadData, isAuthenticated]);

    // Sync tasks when they change (skip initial load)
    useEffect(() => {
        if (!isLoading) {
            syncData('tasks', tasks);
        }
    }, [tasks, isLoading, syncData]);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const addTask = useCallback((task) => {
        const newTask = { ...task, id: Date.now(), completed: false };
        setTasks(prev => [...prev, newTask]);
    }, []);

    const toggleTask = useCallback((id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }, []);

    const deleteTask = useCallback((id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    const updateTask = useCallback((id, updates) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    return (
        <TaskContext.Provider value={{ tasks, isLoading, addTask, toggleTask, deleteTask, updateTask, currentTime }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}

