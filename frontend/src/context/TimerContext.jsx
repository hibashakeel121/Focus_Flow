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
        habits,
        addHabit,
        toggleHabit,
        deleteHabit,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);
