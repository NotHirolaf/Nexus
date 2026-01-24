import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
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

function AppContent() {
  const { user } = useUser();

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
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

import { TimerProvider } from './context/TimerContext';

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
