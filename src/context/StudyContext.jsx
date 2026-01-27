import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';
import { useDataSync } from './DataSyncContext';

const StudyContext = createContext();

export function StudyProvider({ children }) {
    const { notify } = useNotification();
    const [flashcardDecks, setFlashcardDecks] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { loadData, syncData, isAuthenticated } = useDataSync();

    // Load data on mount and when auth state changes
    useEffect(() => {
        const loadStudyData = async () => {
            setIsLoading(true);
            try {
                const [savedDecks, savedQuizzes] = await Promise.all([
                    loadData('flashcards'),
                    loadData('quizzes')
                ]);
                setFlashcardDecks(savedDecks || []);
                setQuizzes(savedQuizzes || []);
            } catch (error) {
                console.error('Error loading study data:', error);
                const localDecks = localStorage.getItem('nexus_flashcards');
                const localQuizzes = localStorage.getItem('nexus_quizzes');
                setFlashcardDecks(localDecks ? JSON.parse(localDecks) : []);
                setQuizzes(localQuizzes ? JSON.parse(localQuizzes) : []);
            } finally {
                setIsLoading(false);
            }
        };
        loadStudyData();
    }, [loadData, isAuthenticated]);

    // Sync flashcard decks when they change
    useEffect(() => {
        if (!isLoading) {
            syncData('flashcards', flashcardDecks);
        }
    }, [flashcardDecks, isLoading, syncData]);

    // Sync quizzes when they change
    useEffect(() => {
        if (!isLoading) {
            syncData('quizzes', quizzes);
        }
    }, [quizzes, isLoading, syncData]);

    const saveDeck = useCallback((title, cards) => {
        setFlashcardDecks(prev => [
            { id: Date.now(), title, cards, date: new Date().toLocaleDateString() },
            ...prev
        ]);
        notify('success', 'Flashcard deck saved!');
    }, [notify]);

    const deleteDeck = useCallback((id) => {
        setFlashcardDecks(prev => prev.filter(d => d.id !== id));
        notify('success', 'Deck deleted');
    }, [notify]);

    const saveQuiz = useCallback((title, questions) => {
        setQuizzes(prev => [
            { id: Date.now(), title, questions, date: new Date().toLocaleDateString() },
            ...prev
        ]);
        notify('success', 'Quiz saved!');
    }, [notify]);

    const deleteQuiz = useCallback((id) => {
        setQuizzes(prev => prev.filter(q => q.id !== id));
        notify('success', 'Quiz deleted');
    }, [notify]);

    return (
        <StudyContext.Provider value={{
            flashcardDecks,
            quizzes,
            isLoading,
            saveDeck,
            deleteDeck,
            saveQuiz,
            deleteQuiz
        }}>
            {children}
        </StudyContext.Provider>
    );
}

export function useStudy() {
    return useContext(StudyContext);
}

