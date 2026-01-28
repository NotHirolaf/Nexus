import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const DataSyncContext = createContext();

// localStorage keys used by the app
const LOCAL_STORAGE_KEYS = {
    user: 'nexus_user',
    tasks: 'nexus_tasks',
    flashcards: 'nexus_flashcards',
    quizzes: 'nexus_quizzes',
    theme: 'theme',
    grades: 'nexus_grades',
    timetable: 'nexus_timetable'
};

export function DataSyncProvider({ children }) {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [hasMigrated, setHasMigrated] = useState(false);

    // Load data - from Firestore if authenticated, localStorage otherwise
    const loadData = useCallback(async (key) => {
        if (isAuthenticated && user?.uid) {
            try {
                // Special handling for collections (tasks, flashcards, quizzes)
                if (key === 'tasks' || key === 'flashcards' || key === 'quizzes') {
                    const collectionRef = collection(db, 'users', user.uid, key);
                    const snapshot = await getDocs(collectionRef);
                    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }

                // Regular document data
                const docRef = doc(db, 'users', user.uid, 'data', key);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return docSnap.data().value;
                }
                return null;
            } catch (error) {
                console.error(`Error loading ${key} from Firestore:`, error);
                // Fallback to localStorage
                const local = localStorage.getItem(LOCAL_STORAGE_KEYS[key]);
                return local ? JSON.parse(local) : null;
            }
        } else {
            // Guest mode - use localStorage
            const local = localStorage.getItem(LOCAL_STORAGE_KEYS[key]);
            return local ? JSON.parse(local) : null;
        }
    }, [isAuthenticated, user?.uid]);

    // Save data - to Firestore if authenticated, localStorage otherwise
    const syncData = useCallback(async (key, data) => {
        // Always save to localStorage as backup
        localStorage.setItem(LOCAL_STORAGE_KEYS[key], JSON.stringify(data));

        // Get current auth user directly from useAuth state
        const currentUid = user?.uid;

        console.log(`[DataSync] syncData called for '${key}', authenticated: ${isAuthenticated}, uid: ${currentUid}`);

        if (isAuthenticated && currentUid) {
            try {
                setIsSyncing(true);

                // Special handling for collections (tasks, flashcards, quizzes)
                if (key === 'tasks' || key === 'flashcards' || key === 'quizzes') {
                    const batch = writeBatch(db);
                    const collectionRef = collection(db, 'users', currentUid, key);

                    // Delete existing documents first
                    const existingDocs = await getDocs(collectionRef);
                    existingDocs.docs.forEach(docItem => {
                        batch.delete(docItem.ref);
                    });

                    // Add new documents
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            const docRef = doc(collectionRef, String(item.id));
                            batch.set(docRef, item);
                        });
                    }

                    await batch.commit();
                    console.log(`[DataSync] Synced collection '${key}' to Firestore for user ${currentUid}`);
                } else {
                    // Regular document data
                    const docRef = doc(db, 'users', currentUid, 'data', key);
                    await setDoc(docRef, { value: data, updatedAt: new Date().toISOString() });
                    console.log(`[DataSync] Synced '${key}' to Firestore for user ${currentUid}`);
                }

                setLastSync(new Date());
            } catch (error) {
                console.error(`[DataSync] Error syncing ${key} to Firestore:`, error);
            } finally {
                setIsSyncing(false);
            }
        } else {
            console.log(`[DataSync] Saved '${key}' to localStorage only (guest mode or no uid)`);
        }
    }, [isAuthenticated, user?.uid]);

    // Migrate local data to cloud on first sign-in
    const migrateLocalToCloud = useCallback(async () => {
        if (!isAuthenticated || !user?.uid || hasMigrated) return;

        try {
            setIsSyncing(true);

            // Check if user already has cloud data
            const profileRef = doc(db, 'users', user.uid, 'data', 'user');
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                // User has cloud data, don't migrate (prefer cloud)
                console.log('Cloud data exists, skipping migration');
                setHasMigrated(true);
                return { migrated: false, reason: 'cloud_data_exists' };
            }

            // Migrate each data type
            const migrations = await Promise.all(
                Object.entries(LOCAL_STORAGE_KEYS).map(async ([key, localKey]) => {
                    const localData = localStorage.getItem(localKey);
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        await syncData(key, parsed);
                        return { key, success: true };
                    }
                    return { key, success: false, reason: 'no_local_data' };
                })
            );

            setHasMigrated(true);
            setLastSync(new Date());

            return { migrated: true, migrations };
        } catch (error) {
            console.error('Error migrating data to cloud:', error);
            return { migrated: false, error: error.message };
        } finally {
            setIsSyncing(false);
        }
    }, [isAuthenticated, user?.uid, hasMigrated, syncData]);

    // Auto-migrate when user signs in
    useEffect(() => {
        if (isAuthenticated && !hasMigrated && !authLoading) {
            migrateLocalToCloud();
        }
    }, [isAuthenticated, hasMigrated, authLoading, migrateLocalToCloud]);

    const value = {
        loadData,
        syncData,
        migrateLocalToCloud,
        isSyncing,
        lastSync,
        isAuthenticated,
        storageMode: isAuthenticated ? 'cloud' : 'local'
    };

    return (
        <DataSyncContext.Provider value={value}>
            {children}
        </DataSyncContext.Provider>
    );
}

export function useDataSync() {
    const context = useContext(DataSyncContext);
    if (context === undefined) {
        throw new Error('useDataSync must be used within a DataSyncProvider');
    }
    return context;
}
