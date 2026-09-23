import Card from "../components/common/Card";
import Button from "../components/common/Button";
import TimerDisplay from "../components/stopwatch/TimerDisplay";
import LapList from "../components/stopwatch/LapList";
import { useTimer } from "../context/TimerContext";

export default function StopwatchPage() {
  const { swTime, swIsRunning, swLaps, startStopSw, resetSw, recordLapSw } = useTimer();

  return (
    <Card title="Stopwatch">
      <TimerDisplay time={swTime} />
      <div className="flex justify-center gap-3">
        <Button onClick={startStopSw} variant={swIsRunning ? "danger" : "primary"}>
          {swIsRunning ? "Pause" : "Start"}
        </Button>
        <Button onClick={recordLapSw} variant="secondary" disabled={!swIsRunning}>
          Lap
        </Button>
        <Button onClick={resetSw} variant="outline">
          Reset
        </Button>
      </div>
      <LapList laps={swLaps} />
    </Card>
  );
}