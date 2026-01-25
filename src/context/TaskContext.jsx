import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('nexus_tasks');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const addTask = (task) => {
        const newTask = { ...task, id: Date.now(), completed: false };
        setTasks([...tasks, newTask]);
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, currentTime }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}
