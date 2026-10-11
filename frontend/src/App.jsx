 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { TimerProvider } from "./context/TimerContext";
import Navbar from "./components/navbar/Navbar";
import TodoPage from "./pages/TodoPage";
import StopwatchPage from "./pages/StopwatchPage";
import TimerPage from "./pages/TimerPage";
import NotepadPage from "./pages/NotepadPage";
import HabitPage from "./pages/HabitPage";
import WordCounterPage from "./pages/WordCounterPage";
import CalculatorPage from "./pages/CalculatorPage";

function AppContent() {
  const { theme, themeStyles } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''} ${themeStyles?.bg || ''}`}>
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 mt-6">
        <Routes>
          <Route path="/" element={<TodoPage />} />
          <Route path="/stopwatch" element={<StopwatchPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/notepad" element={<NotepadPage />} />
          <Route path="/habits" element={<HabitPage />} />
          <Route path="/word-counter" element={<WordCounterPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TimerProvider>
        <Router>
          <AppContent />
        </Router>
      </TimerProvider>
    </ThemeProvider>
  );
}
