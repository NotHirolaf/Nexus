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

    // Save to localStorage immediately whenever user changes
    useEffect(() => {
        if (user) {
            const dataWithTimestamp = { ...user, lastModified: new Date().toISOString() };
            localStorage.setItem('nexus_user', JSON.stringify(dataWithTimestamp));
        }
    }, [user]);

    // Sync with cloud data in background after auth is ready
    useEffect(() => {
        const syncWithCloud = async () => {
            // Only load from cloud if authenticated and haven't loaded yet
            if (!isAuthenticated || hasLoadedCloud) return;

            try {
                setIsLoading(true);
                const cloudData = await loadData('user');
                const localData = localStorage.getItem('nexus_user');
                const localParsed = localData ? JSON.parse(localData) : null;

                // Compare timestamps - only use cloud if it's actually newer
                if (cloudData && localParsed) {
                    const cloudTime = new Date(cloudData.lastModified || 0).getTime();
                    const localTime = new Date(localParsed.lastModified || 0).getTime();

                    if (cloudTime > localTime) {
                        console.log('[UserContext] Cloud data is newer, using cloud');
                        setUser(cloudData);
                        localStorage.setItem('nexus_user', JSON.stringify(cloudData));
                    } else {
                        console.log('[UserContext] Local data is newer, pushing to cloud');
                        // Local is newer, push it to cloud
                        await syncData('user', localParsed);
                    }
                } else if (cloudData && !localParsed) {
                    // No local data, use cloud
                    setUser(cloudData);
                    localStorage.setItem('nexus_user', JSON.stringify(cloudData));
                } else if (localParsed && !cloudData) {
                    // No cloud data, push local to cloud
                    await syncData('user', localParsed);
                }

                setHasLoadedCloud(true);
            } catch (error) {
                console.error('Error loading user data from cloud:', error);
            } finally {
                setIsLoading(false);
            }
        };
        syncWithCloud();
    }, [isAuthenticated, hasLoadedCloud, loadData, syncData]);

    const saveUser = useCallback(async (name, university, credits, courses) => {
        const userData = { name, university, credits, courses, lastModified: new Date().toISOString() };
        setUser(userData);
        await syncData('user', userData);
    }, [syncData]);

    const updateCourses = useCallback(async (newCourses) => {
        if (!user) return;
        const updatedUser = { ...user, courses: newCourses, lastModified: new Date().toISOString() };
        setUser(updatedUser);
        await syncData('user', updatedUser);
    }, [user, syncData]);

    const updateSemesters = useCallback(async (newSemesters) => {
        if (!user) return;
        const updatedUser = { ...user, semesters: newSemesters, lastModified: new Date().toISOString() };
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

