import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const StudyContext = createContext();

export function StudyProvider({ children }) {
    const { notify } = useNotification();
    const [flashcardDecks, setFlashcardDecks] = useState(() => {
        const saved = localStorage.getItem('nexus_flashcards');
        return saved ? JSON.parse(saved) : [];
    });
    const [quizzes, setQuizzes] = useState(() => {
        const saved = localStorage.getItem('nexus_quizzes');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('nexus_flashcards', JSON.stringify(flashcardDecks));
    }, [flashcardDecks]);

    useEffect(() => {
        localStorage.setItem('nexus_quizzes', JSON.stringify(quizzes));
    }, [quizzes]);

    const saveDeck = (title, cards) => {
        setFlashcardDecks(prev => [{ id: Date.now(), title, cards, date: new Date().toLocaleDateString() }, ...prev]);
        notify('success', 'Flashcard deck saved!');
    };

    const deleteDeck = (id) => {
        setFlashcardDecks(prev => prev.filter(d => d.id !== id));
        notify('success', 'Deck deleted');
    };

    const saveQuiz = (title, questions) => {
        setQuizzes(prev => [{ id: Date.now(), title, questions, date: new Date().toLocaleDateString() }, ...prev]);
        notify('success', 'Quiz saved!');
    };

    const deleteQuiz = (id) => {
        setQuizzes(prev => prev.filter(q => q.id !== id));
        notify('success', 'Quiz deleted');
    };

    return (
        <StudyContext.Provider value={{ flashcardDecks, quizzes, saveDeck, deleteDeck, saveQuiz, deleteQuiz }}>
            {children}
        </StudyContext.Provider>
    );
}

export function useStudy() {
    return useContext(StudyContext);
}
