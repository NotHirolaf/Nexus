import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('nexus_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const saveUser = (name, university, credits, courses) => {
        const userData = { name, university, credits, courses };
        setUser(userData);
        localStorage.setItem('nexus_user', JSON.stringify(userData));
    };

    const updateCourses = (newCourses) => {
        if (!user) return;
        const updatedUser = { ...user, courses: newCourses };
        setUser(updatedUser);
        localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider value={{ user, saveUser, updateCourses }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
