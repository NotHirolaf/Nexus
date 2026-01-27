import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    signInWithRedirect,
    getRedirectResult
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL
                });
            } else {
                // User is signed out
                setUser(null);
            }
            setIsLoading(false);
        });

        // Check for redirect result (for Electron compatibility)
        getRedirectResult(auth).catch((error) => {
            console.log('No redirect result or error:', error);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        setError(null);
        try {
            // Try popup first (works in most browsers)
            const result = await signInWithPopup(auth, googleProvider);
            return { success: true, user: result.user };
        } catch (popupError) {
            // If popup blocked, try redirect (better for Electron)
            if (popupError.code === 'auth/popup-blocked' ||
                popupError.code === 'auth/popup-closed-by-user') {
                try {
                    await signInWithRedirect(auth, googleProvider);
                    return { success: true, redirect: true };
                } catch (redirectError) {
                    setError(redirectError.message);
                    return { success: false, error: redirectError.message };
                }
            }
            setError(popupError.message);
            return { success: false, error: popupError.message };
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        signInWithGoogle,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
