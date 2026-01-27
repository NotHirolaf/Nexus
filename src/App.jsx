import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataSyncProvider } from './context/DataSyncContext';
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

function AppContent() {
  const { user, isLoading } = useUser();

  // Show loading state while checking auth/user data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding />;
  }

  return (
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

