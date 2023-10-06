import { useState } from "react";

interface Props {
  getCurrentTime: () => Date;
}

function formatTime(date: Date) {
  // "sv" stands for Sweden which uses the date format YYYY-MM-DD we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}

function App({ getCurrentTime }: Props) {
  const [formattedStartTime, setFormattedStartTime] = useState<string | null>(
    null
  );
  const [formattedStopTime, setFormattedStopTime] = useState<string | null>(
    null
  );
  const isTimerRunning = formattedStartTime !== null;

  function handleButtonClick() {
    if (isTimerRunning) {
      setFormattedStopTime(formatTime(getCurrentTime()));
    } else {
      setFormattedStartTime(formatTime(getCurrentTime()));
    }
  }

  return (
    <>
      <button onClick={handleButtonClick}>
        {isTimerRunning ? "Stop" : "Start"}
      </button>
      <ul>
        <li>
          {formattedStartTime} - {formattedStopTime}
        </li>
      </ul>
    </>
  );
}

export default App;
