import { useState } from "react";

interface Props {
  getCurrentTime: () => Date;
}

function formatTime(date: Date) {
  // "sv" stands for Sweden which uses the date format YYYY-MM-DD we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}

function App({ getCurrentTime }: Props) {
  const [startTime, setStartTime] = useState<string | null>(null);

  function handleStartClick() {
    setStartTime(formatTime(getCurrentTime()));
  }

  return (
    <>
      <button onClick={handleStartClick}>Start</button>
      <ul>
        <li>{startTime}</li>
      </ul>
    </>
  );
}

export default App;
