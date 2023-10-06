interface Props {
  getCurrentTime: () => Date;
}

function formatTime(date: Date) {
  // "sv" stands for Sweden which uses the date format YYYY-MM-DD we want.
  return date.toLocaleString("sv", { dateStyle: "short", timeStyle: "short" });
}

function App({ getCurrentTime }: Props) {
  return (
    <>
      <button>Start</button>
      <ul>
        <li>{formatTime(getCurrentTime())}</li>
      </ul>
    </>
  );
}

export default App;
