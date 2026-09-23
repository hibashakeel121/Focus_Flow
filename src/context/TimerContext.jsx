import { createContext, useContext, useState, useEffect } from "react";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  // --- STOPWATCH STATE ---
  const [swTime, setSwTime] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);
  const [swLaps, setSwLaps] = useState([]);

  useEffect(() => {
    let interval = null;
    if (swIsRunning) {
      interval = setInterval(() => setSwTime((prev) => prev + 10), 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [swIsRunning]);

  const startStopSw = () => setSwIsRunning((prev) => !prev);
  const resetSw = () => {
    setSwIsRunning(false);
    setSwTime(0);
    setSwLaps([]);
  };
  const recordLapSw = () => setSwLaps((prev) => [...prev, swTime]);

  // --- TIMER STATE ---
  const [tmInitial, setTmInitial] = useState(300);
  const [tmLeft, setTmLeft] = useState(300);
  const [tmIsActive, setTmIsActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (tmIsActive && tmLeft > 0) {
      timer = setInterval(() => setTmLeft((prev) => prev - 1), 1000);
    } else if (tmLeft === 0) {
      setTmIsActive(false);
    }
    return () => clearInterval(timer);
  }, [tmIsActive, tmLeft]);

  const toggleTm = () => setTmIsActive((prev) => !prev);
  const resetTm = () => {
    setTmIsActive(false);
    setTmLeft(tmInitial);
  };
  const updateTmInitial = (secs) => {
    setTmInitial(secs);
    setTmLeft(secs);
    setTmIsActive(false);
  };

  // --- IN-MEMORY TODOS ---
  const [todos, setTodos] = useState([]);
  const addTodo = (text) => setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }]);
  const toggleTodo = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const deleteTodo = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  // --- IN-MEMORY HABITS ---
  const [habits, setHabits] = useState([]);
  const addHabit = (name) => setHabits((prev) => [...prev, { id: Date.now(), name, streak: 0, completedToday: false }]);
  const toggleHabit = (id) =>
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    );
  const deleteHabit = (id) => setHabits((prev) => prev.filter((h) => h.id !== id));

  // --- IN-MEMORY MULTIPLE NOTES ---
  const [notes, setNotes] = useState([
    { id: 1, title: "Quick Note", content: "" }
  ]);
  const [activeNoteId, setActiveNoteId] = useState(1);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: `Note ${notes.length + 1}`,
      content: ""
    };
    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id, content) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content } : note))
    );
  };

  const updateNoteTitle = (id, title) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, title } : note))
    );
  };

  const deleteNote = (id) => {
    if (notes.length === 1) return; // keep at least one note
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0].id);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        swTime,
        swIsRunning,
        swLaps,
        startStopSw,
        resetSw,
        recordLapSw,
        tmInitial,
        tmLeft,
        tmIsActive,
        toggleTm,
        resetTm,
        updateTmInitial,
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
        habits,
        addHabit,
        toggleHabit,
        deleteHabit,
        notes,
        activeNoteId,
        setActiveNoteId,
        addNote,
        updateNote,
        updateNoteTitle,
        deleteNote,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);