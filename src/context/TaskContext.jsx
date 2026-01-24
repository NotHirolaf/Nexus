import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

const SAMPLE_TASKS = [
    { id: 1, title: 'CS 101 Final Project', date: '2026-02-28', tag: 'School', priority: 'high', completed: false },
    { id: 2, title: 'Apply for Internship', date: '2026-01-30', tag: 'Personal', priority: 'normal', completed: false },
    { id: 3, title: 'Buy Groceries', date: '2026-01-24', tag: 'Personal', priority: 'normal', completed: true },
];

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('nexus_tasks');
        return saved ? JSON.parse(saved) : SAMPLE_TASKS;
    });

    useEffect(() => {
        localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
    }, [tasks]);

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
        <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}
