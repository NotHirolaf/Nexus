import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import GradeCalculator from './pages/GradeCalculator';
import GpaCalculator from './pages/GpaCalculator';
import TodoList from './pages/TodoList';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="grades" element={<GradeCalculator />} />
            <Route path="gpa" element={<GpaCalculator />} />
            <Route path="todo" element={<TodoList />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
