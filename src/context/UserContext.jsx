import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDataSync } from './DataSyncContext';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { loadData, syncData, isAuthenticated } = useDataSync();

    // Load user data on mount and when auth state changes
    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            try {
                const userData = await loadData('user');
                setUser(userData);
            } catch (error) {
                console.error('Error loading user data:', error);
                // Fallback to localStorage
                const savedUser = localStorage.getItem('nexus_user');
                setUser(savedUser ? JSON.parse(savedUser) : null);
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, [loadData, isAuthenticated]);

    const saveUser = useCallback(async (name, university, credits, courses) => {
        const userData = { name, university, credits, courses };
        setUser(userData);
        await syncData('user', userData);
    }, [syncData]);

    const updateCourses = useCallback(async (newCourses) => {
        if (!user) return;
        const updatedUser = { ...user, courses: newCourses };
        setUser(updatedUser);
        await syncData('user', updatedUser);
    }, [user, syncData]);

    const updateSemesters = useCallback(async (newSemesters) => {
        if (!user) return;
        const updatedUser = { ...user, semesters: newSemesters };
        setUser(updatedUser);
        await syncData('user', updatedUser);
    }, [user, syncData]);

    // Clear user data (for sign out or reset)
    const clearUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem('nexus_user');
    }, []);

    return (
        <UserContext.Provider value={{ user, isLoading, saveUser, updateCourses, updateSemesters, clearUser }}>
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

