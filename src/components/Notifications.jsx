import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertOctagon className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
};

const styles = {
    success: 'border-green-500/20 bg-green-500/10 text-green-800 dark:text-green-200',
    error: 'border-red-500/20 bg-red-500/10 text-red-800 dark:text-red-200',
    warning: 'border-orange-500/20 bg-orange-500/10 text-orange-800 dark:text-orange-200',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-200'
};

export const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
            <div
                key={toast.id}
                className={`pointer-events-auto min-w-[300px] flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-xl animate-in slide-in-from-right-full duration-300 ${styles[toast.type] || styles.info}`}
            >
                {icons[toast.type] || icons.info}
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                </button>
            </div>
        ))}
    </div>
);

export const ConfirmDialog = ({ title, message, confirmText, type, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'}`}>
                {type === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {message}
            </p>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 px-4 font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`flex-1 py-2.5 px-4 font-bold text-white rounded-xl transition-colors ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);
