import Card from "../components/common/Card";
import Button from "../components/common/Button";
import TimerInput from "../components/timer/TimerInput";
import { useTimer } from "../context/TimerContext";

export default function TimerPage() {
  const { tmInitial, tmLeft, tmIsActive, toggleTm, resetTm, updateTmInitial } = useTimer();

  return (
    <Card title="Timer">
      <TimerInput seconds={tmInitial} onChange={updateTmInitial} disabled={tmIsActive} />
      <div className="text-4xl font-mono text-center font-bold my-4 text-rose-500">
        {Math.floor(tmLeft / 60)}:{String(tmLeft % 60).padStart(2, "0")}
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={toggleTm} variant={tmIsActive ? "danger" : "primary"}>
          {tmIsActive ? "Pause" : "Start"}
        </Button>
        <Button onClick={resetTm} variant="outline">
          Reset
        </Button>
      </div>
    </Card>
  );
}
