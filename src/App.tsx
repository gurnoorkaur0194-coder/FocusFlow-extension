/// <reference types="chrome" />
import { useState, useEffect } from "react";

function App() {
  const [goal, setGoal] = useState("");
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
const [elapsedTime, setElapsedTime] = useState(0);

  // Load saved session on startup
  useEffect(() => {
  chrome.storage.local.get(["focusSession", "visits", "sessionStart"], (result: any) => {
    const session = result.focusSession;

    if (typeof session === "string") {
      setActiveGoal(session);
    }
    if (result.visits) {
    setVisits(result.visits);
      }
    if (result.sessionStart) {
      setSessionStart(result.sessionStart);
    }
  });
}, []);

// Timer Effect
useEffect(() => {

    if (!sessionStart) return;

    const interval = setInterval(() => {

        const seconds = Math.floor(
            (Date.now() - sessionStart) / 1000
        );

        setElapsedTime(seconds);

    }, 1000);

    return () => clearInterval(interval);

}, [sessionStart]);

  // Start session
  const startSession = () => {
    if (!goal) return;

   const start = Date.now();

chrome.storage.local.set(
{
    focusSession: goal,
    sessionStart: start,
    visits: []
},
() => {
    setActiveGoal(goal);
    setSessionStart(start);
    setVisits([]);
    setGoal("");
});

};
  // End session
  const endSession = () => {

    chrome.storage.local.remove(
        ["focusSession", "visits", "sessionStart"],
        () => {
            setActiveGoal(null);
            setSessionStart(null);
            setElapsedTime(0);
            setVisits([]);
        }
    );

};

function formatTime(seconds: number) {

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;

}

const totalVisits = visits.length;

const distractingVisits = visits.filter(
    visit => visit.distracting
).length;

const focusedVisits = totalVisits - distractingVisits;

const focusScore =
    totalVisits === 0
        ? 100
        : Math.round(
            (focusedVisits / totalVisits) * 100
        );

const scoreColor =
focusScore >= 80
? "#22c55e"
: focusScore >= 50
? "#facc15"
: "#ef4444";

  return (
  <div style={styles.container}>
    <div style={styles.card}>
      <h2 style={styles.title}>FocusFlow </h2>

      {!activeGoal ? (
        <>
          <input
            style={styles.input}
            placeholder="What are you studying?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <button style={styles.button} onClick={startSession}>
            Start Session
          </button>
        </>
      ) : (
        <>
          <p style={styles.text}>Studying: {activeGoal}</p>
          <p style={styles.text}>
              ⏱ Session: {formatTime(elapsedTime)}
              </p>

          <div
            style={{
                marginTop: "15px",
                padding: "12px",
                background: "#273549",
                borderRadius: "10px"
            }}
    >
<h3>Focus Dashboard</h3>

<span
style={{
color: scoreColor,
fontWeight:"bold"
}}
>
{focusScore}%
</span>

<p>✅ Focused Sites: {focusedVisits}</p>

<p>⚠️ Distracting Sites: {distractingVisits}</p>

<p>🌐 Total Visits: {totalVisits}</p>

</div> 

          <h3 style={{ marginTop: "15px" }}>
              Recent Activity
              </h3>

              {visits.slice(-5).reverse().map((visit, index) => (
  <div
    key={index}
    style={{
      marginBottom: "10px",
      textAlign: "left",
      borderBottom: "1px solid #333",
      paddingBottom: "6px"
    }}
  >
    <strong>
      {visit.distracting ? "⚠️" : "✅"} {visit.website}
    </strong>

    <div
      style={{
        fontSize: "12px",
        color: "#9ca3af",
        marginTop: "3px"
      }}
    >
      <div
    style={{
        fontSize: "11px",
        color: "#60a5fa"
    }}
    >
    Goal: {visit.goal}
    </div>
      {visit.title}
    </div>
  </div>
))}

          <button style={styles.button} onClick={endSession}>
            End Session
          </button>
        </>
      )}
    </div>
  </div>

);

}
const styles: any = {
  container: {
  width: "340px",
  minHeight: "240px",
  backgroundColor: "#0f172a",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
},

  card: {
  width: "100%",
  backgroundColor: "#1e293b",
  borderRadius: "16px",
  padding: "20px",
  color: "white",
},

  title: {
    marginBottom: "12px",
    fontSize: "18px",
  },

  input: {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #334155",
  backgroundColor: "#334155",
  color: "white",
  marginBottom: "12px",
  fontSize: "14px",
},

  button: {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
},

  text: {
    marginBottom: "10px",
  },
};
export default App;