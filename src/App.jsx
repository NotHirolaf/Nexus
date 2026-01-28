import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataSyncProvider, useDataSync } from './context/DataSyncContext';
import { UserProvider, useUser } from './context/UserContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Pomodoro from './pages/Pomodoro';
import GradeCalculator from './pages/GradeCalculator';
import GpaCalculator from './pages/GpaCalculator';
import TodoList from './pages/TodoList';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import AiStudyTool from './pages/AiStudyTool';
import { TimerProvider } from './context/TimerContext';
import { TaskProvider } from './context/TaskContext';
import { StudyProvider } from './context/StudyContext';
import { BookOpen, Cloud, RefreshCw } from 'lucide-react';

function LoadingScreen({ message = "Loading your workspace..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-6">
        {/* Branded logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* App name */}
        <h1 className="text-2xl font-bold text-white">Nexus</h1>

        {/* Loading indicator */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-200 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

function SyncIndicator() {
  const { isSyncing } = useDataSync();

  if (!isSyncing) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-blue-500/90 text-white px-3 py-1.5 rounded-full text-sm shadow-lg animate-pulse">
      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      <span>Syncing...</span>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useUser();
  const { isLoading: authLoading } = useAuth();
  const { isSyncing } = useDataSync();

  // Only show loading if we're waiting for initial auth check
  // Skip loading for users with cached local data
  if (authLoading && !user) {
    return <LoadingScreen message="Connecting..." />;
  }

  if (isLoading && !user) {
    return <LoadingScreen message="Loading your data..." />;
  }

  if (!user) {
    return <Onboarding />;
  }

  return (
    <>
      <SyncIndicator />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="grades" element={<GradeCalculator />} />
            <Route path="gpa" element={<GpaCalculator />} />
            <Route path="todo" element={<TodoList />} />
            <Route path="study" element={<AiStudyTool />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataSyncProvider>
        <ThemeProvider>
          <UserProvider>
            <TaskProvider>
              <TimerProvider>
                <StudyProvider>
                  <AppContent />
                </StudyProvider>
              </TimerProvider>
            </TaskProvider>
          </UserProvider>
        </ThemeProvider>
      </DataSyncProvider>
    </AuthProvider>
  );
}

export default App;

