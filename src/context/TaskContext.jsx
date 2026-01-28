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
    const [hasLoadedCloud, setHasLoadedCloud] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { loadData, syncData, isAuthenticated } = useDataSync();
    const lastSyncRef = useRef(Date.now());

    // Save to localStorage immediately on every change
    useEffect(() => {
        localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
        localStorage.setItem('nexus_tasks_modified', Date.now().toString());
    }, [tasks]);

    // Sync with cloud in background
    useEffect(() => {
        const syncWithCloud = async () => {
            if (!isAuthenticated || hasLoadedCloud) return;

            try {
                setIsLoading(true);
                const cloudTasks = await loadData('tasks');
                const localModified = parseInt(localStorage.getItem('nexus_tasks_modified') || '0');

                // Compare - if we have local tasks that were modified after last cloud sync, push them
                if (cloudTasks && cloudTasks.length > 0) {
                    // Cloud has data
                    if (tasks.length === 0) {
                        // No local tasks, use cloud
                        setTasks(cloudTasks);
                    } else if (localModified > lastSyncRef.current) {
                        // Local was modified, push to cloud
                        console.log('[TaskContext] Local tasks are newer, pushing to cloud');
                        await syncData('tasks', tasks);
                    } else {
                        // Use cloud data
                        console.log('[TaskContext] Using cloud tasks');
                        setTasks(cloudTasks);
                    }
                } else if (tasks.length > 0) {
                    // No cloud data but we have local, push to cloud
                    console.log('[TaskContext] Pushing local tasks to cloud');
                    await syncData('tasks', tasks);
                }

                lastSyncRef.current = Date.now();
                setHasLoadedCloud(true);
            } catch (error) {
                console.error('Error syncing tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };
        syncWithCloud();
    }, [isAuthenticated, hasLoadedCloud, loadData, syncData, tasks]);

    // Sync to cloud when tasks change (after initial load)
    useEffect(() => {
        if (hasLoadedCloud && isAuthenticated) {
            syncData('tasks', tasks);
        }
    }, [tasks, hasLoadedCloud, isAuthenticated, syncData]);

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

