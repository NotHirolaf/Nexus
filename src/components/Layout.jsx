import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500 ease-in-out">
            {/* Sidebar - Fixed or Flex Item */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="glass-panel w-full min-h-[calc(100vh-4rem)] rounded-3xl p-1 md:p-2 border-white/20">
                    <div className="w-full h-full rounded-2xl overflow-hidden">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
