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
    const { subscribeToData, addTaskDoc, updateTaskDoc, deleteTaskDoc, isAuthenticated } = useDataSync();

    // Save to localStorage immediately on every change
    useEffect(() => {
        localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Subscribe to real-time updates from Firestore with smart merge
    useEffect(() => {
        if (!isAuthenticated) return;

        console.log('[TaskContext] Setting up real-time subscription');
        let isFirstLoad = true;

        const unsubscribe = subscribeToData('tasks', async (cloudTasks) => {
            console.log('[TaskContext] Received real-time update:', cloudTasks.length, 'tasks');

            if (isFirstLoad) {
                isFirstLoad = false;

                // Smart merge on first load
                if (cloudTasks.length === 0 && tasks.length > 0) {
                    // Cloud is empty, but we have local data → push to cloud
                    console.log('[TaskContext] Cloud empty, pushing', tasks.length, 'local tasks to cloud');
                    try {
                        await Promise.all(tasks.map(task => addTaskDoc(task)));
                        console.log('[TaskContext] Successfully pushed local tasks to cloud');
                    } catch (error) {
                        console.error('[TaskContext] Failed to push local tasks:', error);
                    }
                    // Keep local data in UI
                } else if (cloudTasks.length > 0) {
                    // Cloud has data → use it
                    console.log('[TaskContext] Loading', cloudTasks.length, 'tasks from cloud');
                    setTasks(cloudTasks);
                }
                // If both empty, do nothing
            } else {
                // Subsequent updates: just apply from cloud
                setTasks(cloudTasks);
            }
        });

        return () => {
            console.log('[TaskContext] Cleaning up real-time subscription');
            unsubscribe();
        };
    }, [isAuthenticated, subscribeToData, tasks, addTaskDoc]);



    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const addTask = useCallback((task) => {
        const newTask = { ...task, id: Date.now(), completed: false };

        // Optimistic update: UI instantly, sync in background
        setTasks(prev => [...prev, newTask]);

        if (isAuthenticated) {
            addTaskDoc(newTask).catch(error => {
                console.error('[TaskContext] Failed to add task, rolling back:', error);
                setTasks(prev => prev.filter(t => t.id !== newTask.id));
            });
        }
    }, [isAuthenticated, addTaskDoc]);

    const toggleTask = useCallback((id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;

        // Optimistic update: UI instantly, sync in background
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t));

        if (isAuthenticated) {
            updateTaskDoc(id, { ...task, completed: newCompleted }).catch(error => {
                console.error('[TaskContext] Failed to toggle task, rolling back:', error);
                setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !newCompleted } : t));
            });
        }
    }, [tasks, isAuthenticated, updateTaskDoc]);

    const deleteTask = useCallback((id) => {
        const deletedTask = tasks.find(t => t.id === id);
        if (!deletedTask) return;

        // Optimistic update: UI instantly, sync in background
        setTasks(prev => prev.filter(t => t.id !== id));

        if (isAuthenticated) {
            deleteTaskDoc(id).catch(error => {
                console.error('[TaskContext] Failed to delete task, rolling back:', error);
                setTasks(prev => [...prev, deletedTask]);
            });
        }
    }, [tasks, isAuthenticated, deleteTaskDoc]);

    const updateTask = useCallback((id, updates) => {
        const oldTask = tasks.find(t => t.id === id);
        if (!oldTask) return;

        const updatedTask = { ...oldTask, ...updates };

        // Optimistic update: UI instantly, sync in background
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));

        if (isAuthenticated) {
            updateTaskDoc(id, updatedTask).catch(error => {
                console.error('[TaskContext] Failed to update task, rolling back:', error);
                setTasks(prev => prev.map(t => t.id === id ? oldTask : t));
            });
        }
    }, [tasks, isAuthenticated, updateTaskDoc]);

    return (
        <TaskContext.Provider value={{ tasks, isLoading, addTask, toggleTask, deleteTask, updateTask, currentTime }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}

