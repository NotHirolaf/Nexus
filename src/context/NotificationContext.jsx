import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ConfirmDialog } from '../components/Notifications';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [modalConfig, setModalConfig] = useState(null);

    // Toast Logic
    const notify = useCallback((type, message, duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    // Modal Logic
    const confirm = useCallback(({ title, message, confirmText = 'Confirm', type = 'danger' }) => {
        return new Promise((resolve) => {
            setModalConfig({
                isOpen: true,
                title,
                message,
                confirmText,
                type,
                onConfirm: () => {
                    setModalConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(false);
                }
            });
        });
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify, confirm }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            {modalConfig && <ConfirmDialog {...modalConfig} />}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
