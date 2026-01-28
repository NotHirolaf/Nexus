import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDataSync } from './DataSyncContext';

const UserContext = createContext();

export function UserProvider({ children }) {
    // Initialize with localStorage data immediately (no loading delay)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('nexus_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoadedCloud, setHasLoadedCloud] = useState(false);
    const { loadData, syncData, isAuthenticated } = useDataSync();

    // Sync with cloud data in background after auth is ready
    useEffect(() => {
        const syncWithCloud = async () => {
            // Only load from cloud if authenticated and haven't loaded yet
            if (!isAuthenticated || hasLoadedCloud) return;

            try {
                setIsLoading(true);
                const cloudData = await loadData('user');
                if (cloudData) {
                    setUser(cloudData);
                    // Also update localStorage for faster future loads
                    localStorage.setItem('nexus_user', JSON.stringify(cloudData));
                }
                setHasLoadedCloud(true);
            } catch (error) {
                console.error('Error loading user data from cloud:', error);
            } finally {
                setIsLoading(false);
            }
        };
        syncWithCloud();
    }, [isAuthenticated, hasLoadedCloud, loadData]);

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

