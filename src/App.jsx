
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import BottomNav from "./components/BottomNav";
import "./App.css";

const PAGE_NAMES = [
  "Dashboard",
  "Log Symptoms",
  "Symptom History",
  "Trends & Analytics",
  "AI Health Companion",
  "Insights",
  "Doctor-ready Report",
  "Calendar & Cycle",
  "Safety & Education",
];

const SYMPTOMS = ["Cramps", "Headache", "Fatigue", "Other"];
const MOODS = ["Calm", "Anxious", "Irritable", "Sad"];
const FATIGUE = ["Low", "Moderate", "High"];
const BLEEDING = ["Light", "Moderate", "Heavy", "None"];

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function readEntries() {
  try {
    const stored = localStorage.getItem("herhealth-symptoms");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [entries, setEntries] = useState(readEntries);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("herhealth-symptoms", JSON.stringify(entries));
  }, [entries]);

  function navigateTo(page) {
    if (page === "More") page = "Safety & Education";
    setActivePage(page);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveEntry(entry) {
    setEntries((current) => [
      { ...entry, id: crypto.randomUUID?.() || String(Date.now()) },
      ...current,
    ]);
    setNotice("Your entry was saved on this device.");
    setActivePage("Symptom History");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteEntry(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setNotice("Entry deleted from this device.");
  }

  const pageTitles = {
    Dashboard: "Your health, your story.",
    "Log Symptoms": "Log symptoms",
    "Symptom History": "Symptom history",
    "Trends & Analytics": "Trends & analytics",
    "AI Health Companion": "AI health companion",
    Insights: "Your insights",
    "Doctor-ready Report": "Doctor-ready report",
    "Calendar & Cycle": "Calendar & cycle",
    "Safety & Education": "Safety & education",
  };

  return (
    <div className="app-backdrop">
      <div className="mobile-app">
        <Header onHome={() => navigateTo("Dashboard")} />

        <main className="mobile-content">
          {notice && (
            <div className="notice-banner" role="status">
              <span>♡</span> {notice}
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}

          {activePage === "Dashboard" && (
            <Dashboard entries={entries} onNavigate={navigateTo} />
          )}

          {activePage === "Log Symptoms" && (
            <LogSymptoms onSave={saveEntry} />
          )}

          {activePage === "Symptom History" && (
            <SymptomHistory
              entries={entries}
              onDelete={deleteEntry}
              onAdd={() => navigateTo("Log Symptoms")}
            />
          )}

          {activePage === "Trends & Analytics" && (
            <Trends entries={entries} />
          )}

          {activePage === "AI Health Companion" && <Companion />}

          {activePage === "Insights" && <Insights entries={entries} />}

          {activePage === "Doctor-ready Report" && (
            <DoctorReport entries={entries} />
          )}

          {activePage === "Calendar & Cycle" && (
            <CycleCalendar entries={entries} />
          )}

          {activePage === "Safety & Education" && <SafetyEducation />}
        </main>

        <BottomNav
          activePage={activePage}
          onNavigate={navigateTo}
        />
      </div>
    </div>
  );
}

function Header({ onHome }) {
  return (
    <header className="mobile-header">
      <button
        className="brand-button"
        type="button"
        onClick={onHome}
        aria-label="HerHealth home"
      >
        <span className="brand-symbol">h</span>
        <span className="brand-name">
          <strong>HerHealth AI</strong>
          <small>YOUR HEALTH, YOUR STORY</small>
        </span>
      </button>
      <span className="header-heart" aria-hidden="true">♡</span>
    </header>
  );
}

function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}

function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="page-intro">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="screen-heading">{title}</h1>
      {description && <p className="screen-description">{description}</p>}
    </div>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="section-title-row">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function Dashboard({ entries, onNavigate }) {
  const recent = entries.slice(0, 3);
  const insightCount = entries.length >= 3 ? 1 : 0;

  return (
    <>
      <section className="greeting">
        <div className="greeting-copy-wrap">
          <Eyebrow>YOUR PERSONAL HEALTH COMPANION</Eyebrow>
          <h1>Your health,<br />your story.</h1>
          <p className="greeting-copy">
            A little more understanding, a little more peace of mind.
          </p>
        </div>
        <span className="greeting-flower" aria-hidden="true">✿</span>
      </section>

      <button
        className="log-cta"
        type="button"
        onClick={() => onNavigate("Log Symptoms")}
      >
        <span className="cta-icon">＋</span>
        <span className="cta-copy">
          <strong>Log your symptoms</strong>
          <small>Take a moment to check in with yourself</small>
        </span>
        <span className="cta-arrow">⟶</span>
      </button>

      <section className="mobile-section">
        <SectionHeading
          eyebrow="YOUR WELLNESS"
          title="Your overview"
          action={<span className="tiny-badge">Today</span>}
        />

        <div className="overview-grid">
          <StatCard
            icon="♡"
            tone="lavender"
            label="Symptom entries"
            value={entries.length}
            detail={entries.length ? "Entries on this device" : "Awaiting your first entry"}
          />
          <StatCard
            icon="✧"
            tone="mint"
            label="Insights"
            value={insightCount}
            detail={insightCount ? "Basic pattern available" : "Build from your records"}
          />
        </div>
      </section>

      <section className="mobile-section">
        <SectionHeading eyebrow="YOUR NEXT STEP" title="Gentle progress" />
        <article className="progress-card">
          <span className="progress-icon">♡</span>
          <div className="progress-text">
            <strong>{entries.length ? "Keep checking in" : "Start with a check-in"}</strong>
            <p>
              Tracking how you feel can help you describe your experiences
              during a healthcare appointment.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate("Log Symptoms")}
            >
              {entries.length ? "Add another entry" : "Make your first entry"} →
            </button>
          </div>
        </article>
      </section>

      <section className="mobile-section">
        <SectionHeading eyebrow="RECENT ACTIVITY" title="Your latest entries" />
        {recent.length ? (
          <div className="entry-list">
            {recent.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
            <button
              className="secondary-button"
              type="button"
              onClick={() => onNavigate("Symptom History")}
            >
              View all history →
            </button>
          </div>
        ) : (
          <EmptyState
            icon="♡"
            title="Your story starts here"
            description="Your saved symptom entries will appear here."
            action="Log your first symptom"
            onClick={() => onNavigate("Log Symptoms")}
          />
        )}
      </section>

      <section className="mobile-section">
        <SectionHeading eyebrow="EXPLORE" title="Your health tools" />
        <div className="tools-list">
          <ToolRow icon="▤" title="Symptom history" description="Review your recorded entries" onClick={() => onNavigate("Symptom History")} />
          <ToolRow icon="↗" title="Trends & analytics" description="Explore changes over time" onClick={() => onNavigate("Trends & Analytics")} />
          <ToolRow icon="▧" title="Doctor-ready report" description="Prepare a summary for your visit" onClick={() => onNavigate("Doctor-ready Report")} />
          <ToolRow icon="✧" title="Health companion" description="Explore health education and questions" onClick={() => onNavigate("AI Health Companion")} />
        </div>
      </section>

      <p className="privacy-note">
        ♡ Your health matters. Your information should be handled with care.
        Entries currently stay in this browser on this device.
      </p>
    </>
  );
}

function StatCard({ icon, tone, label, value, detail }) {
  return (
    <article className="overview-card">
      <span className={`overview-icon ${tone}`}>{icon}</span>
      <span className="overview-label">{label}</span>
      <strong className="overview-value">{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ToolRow({ icon, title, description, onClick }) {
  return (
    <button className="tool-row" type="button" onClick={onClick}>
      <span className="tool-icon">{icon}</span>
      <span className="tool-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="tool-arrow">›</span>
    </button>
  );
}

function EmptyState({ icon = "♡", title, description, action, onClick }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && onClick && (
        <button className="secondary-button" type="button" onClick={onClick}>
          {action}
        </button>
      )}
    </div>
  );
}

function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <fieldset className="choice-field">
      <legend>{label}</legend>
      <div className="choice-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`choice-pill ${value === option ? "selected" : ""}`}
            onClick={() => onChange(option)}
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function LogSymptoms({ onSave }) {
  const [date, setDate] = useState(localDate());
  const [symptom, setSymptom] = useState("Cramps");
  const [pain, setPain] = useState(6);
  const [duration, setDuration] = useState("2–6 hours");
  const [bleeding, setBleeding] = useState("Moderate");
  const [mood, setMood] = useState("Anxious");
  const [fatigue, setFatigue] = useState("Moderate");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!date || !symptom) {
      setError("Please choose a date and symptom type.");
      return;
    }
    setError("");
    onSave({
      date,
      symptom,
      pain: symptom === "Other" ? null : Number(pain),
      duration,
      bleeding,
      mood,
      fatigue,
      notes: notes.trim(),
    });
  }

  return (
    <section className="form-screen">
      <PageIntro
        eyebrow="CHECK IN WITH YOURSELF"
        title="Log symptoms"
        description="Every entry helps you keep track of how you feel."
      />

      <form className="symptom-form" onSubmit={submit}>
        <label className="form-label" htmlFor="entry-date">Date</label>
        <input
          id="entry-date"
          className="form-control"
          type="date"
          value={date}
          max={localDate()}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <ChoiceGroup label="Symptom type" options={SYMPTOMS} value={symptom} onChange={setSymptom} />

        <div className="form-field">
          <div className="range-label-row">
            <label className="form-label" htmlFor="pain-range">Pain severity (0–10)</label>
            <output className="range-value" htmlFor="pain-range">{pain}</output>
          </div>
          <input
            id="pain-range"
            className="pain-range"
            type="range"
            min="0"
            max="10"
            value={pain}
            onChange={(event) => setPain(Number(event.target.value))}
          />
          <div className="range-endpoints">
            <span>No pain</span>
            <span>Worst pain</span>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="duration">Duration</label>
          <select
            id="duration"
            className="form-control"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          >
            <option>Less than 1 hour</option>
            <option>1–2 hours</option>
            <option>2–6 hours</option>
            <option>6–12 hours</option>
            <option>More than 12 hours</option>
            <option>Ongoing</option>
          </select>
        </div>

        <ChoiceGroup label="Bleeding level" options={BLEEDING} value={bleeding} onChange={setBleeding} />
        <ChoiceGroup label="Mood" options={MOODS} value={mood} onChange={setMood} />
        <ChoiceGroup label="Fatigue" options={FATIGUE} value={fatigue} onChange={setFatigue} />

        <div className="form-field">
          <label className="form-label" htmlFor="entry-notes">Notes (optional)</label>
          <textarea
            id="entry-notes"
            className="form-control notes-input"
            rows="3"
            maxLength="1000"
            placeholder="Anything else you'd like to remember..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <small className="field-hint">{notes.length}/1000 characters</small>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="primary-button" type="submit">Save Entry</button>
        <p className="form-footnote">
          Saved on this device only. This is a tracking tool, not a diagnosis.
        </p>
      </form>
    </section>
  );
}

function EntryCard({ entry, onDelete }) {
  const formattedDate = entry.date
    ? new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date not set";

  return (
    <article className="entry-card">
      <span className="entry-symbol">♡</span>
      <div className="entry-main">
        <strong>{entry.symptom}</strong>
        <span>{formattedDate}</span>
        <small>
          {entry.pain !== null && entry.pain !== undefined
            ? `Pain ${entry.pain}/10`
            : "Pain not recorded"}
          {" · "}{entry.fatigue || "Fatigue not recorded"}
        </small>
        {entry.notes && <p className="entry-notes">{entry.notes}</p>}
      </div>
      {onDelete && (
        <button
          className="delete-button"
          type="button"
          onClick={() => onDelete(entry.id)}
          aria-label={`Delete ${entry.symptom} entry from ${formattedDate}`}
        >
          ×
        </button>
      )}
    </article>
  );
}

function SymptomHistory({ entries, onDelete, onAdd }) {
  const [filter, setFilter] = useState("All");
  const filtered = entries.filter((entry) => filter === "All" || entry.symptom === filter);

  return (
    <>
      <PageIntro eyebrow="YOUR RECORDS" title="Symptom history" description="Your personal record of how you have been feeling." />
      <div className="filter-row" aria-label="Filter symptom history">
        {["All", ...SYMPTOMS].map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill ${filter === item ? "selected" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="entry-list">
          {filtered.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="▤"
          title="No entries yet"
          description="Once you save a symptom entry, it will appear here."
          action="Log a symptom"
          onClick={onAdd}
        />
      )}
      <p className="privacy-note">Your entries are stored locally in this browser until backend syncing is added.</p>
    </>
  );
}

function Trends({ entries }) {
  const [period, setPeriod] = useState("30 days");

  const chartEntries = useMemo(() => {
    const days = period === "7 days" ? 7 : period === "30 days" ? 30 : 90;
    const start = new Date();
    start.setDate(start.getDate() - days + 1);

    const filtered = entries.filter((entry) => {
      const entryDate = new Date(`${entry.date}T12:00:00`);
      return entryDate >= start;
    });

    const byDate = {};
    filtered.forEach((entry) => {
      byDate[entry.date] ||= { date: entry.date, painTotal: 0, painCount: 0, count: 0 };
      byDate[entry.date].count += 1;
      if (typeof entry.pain === "number") {
        byDate[entry.date].painTotal += entry.pain;
        byDate[entry.date].painCount += 1;
      }
    });

    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        label: new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        pain: item.painCount ? Number((item.painTotal / item.painCount).toFixed(1)) : null,
      }));
  }, [entries, period]);

  const counts = SYMPTOMS.map((symptom) => ({
    symptom,
    count: entries.filter((entry) => entry.symptom === symptom).length,
  }));

  return (
    <>
      <PageIntro eyebrow="YOUR WELLNESS DATA" title="Trends & analytics" description="Explore your recorded entries over time. Trends describe your logs, not a diagnosis." />
      <div className="filter-row">
        {["7 days", "30 days", "3 months"].map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill ${period === item ? "selected" : ""}`}
            onClick={() => setPeriod(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="chart-card">
        <h2>Pain severity trend</h2>
        <p className="card-subtitle">Average pain score on days you recorded entries</p>
        {chartEntries.some((item) => item.pain !== null) ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartEntries}>
                <CartesianGrid stroke="#eee5f2" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#93869f", fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fill: "#93869f", fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pain"
                  name="Pain score"
                  stroke="#79529a"
                  strokeWidth={3}
                  connectNulls
                  dot={{ r: 4, fill: "#79529a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="↗" title="Not enough data yet" description="Record symptoms with pain scores to see your trend." />
        )}
      </section>

      <section className="chart-card">
        <h2>Symptom frequency</h2>
        <p className="card-subtitle">Number of saved entries by symptom type</p>
        {entries.length ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={counts} layout="vertical" margin={{ left: 4, right: 16 }}>
                <CartesianGrid stroke="#eee5f2" strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "#93869f", fontSize: 10 }} />
                <YAxis type="category" dataKey="symptom" width={70} tick={{ fill: "#776584", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Entries" fill="#b9a0d4" radius={[0, 7, 7, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon="▥" title="Your chart will grow with you" description="Save entries to see symptom frequency." />
        )}
      </section>
    </>
  );
}

function Insights({ entries }) {
  const highPain = entries.filter((entry) => typeof entry.pain === "number" && entry.pain >= 7);
  const symptomCounts = SYMPTOMS
    .map((symptom) => ({ symptom, count: entries.filter((entry) => entry.symptom === symptom).length }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const top = symptomCounts[0];

  return (
    <>
      <PageIntro eyebrow="YOUR PERSONAL SUMMARY" title="Your insights" description="Simple observations based only on the entries you have saved." />
      {entries.length === 0 ? (
        <EmptyState icon="✧" title="Insights start with your records" description="After you log symptoms, this page can summarise the entries available on this device." />
      ) : (
        <>
          <article className="insight-card insight-purple">
            <span className="insight-icon">✧</span>
            <div>
              <h3>Your tracking summary</h3>
              <p>You have saved {entries.length} {entries.length === 1 ? "entry" : "entries"} on this device.</p>
            </div>
          </article>
          {top && (
            <article className="insight-card insight-mint">
              <span className="insight-icon">♡</span>
              <div>
                <h3>Most logged symptom</h3>
                <p>{top.symptom} appears in {top.count} {top.count === 1 ? "entry" : "entries"} in your saved records.</p>
              </div>
            </article>
          )}
          <article className="insight-card insight-pink">
            <span className="insight-icon">!</span>
            <div>
              <h3>Pain scores to review</h3>
              <p>
                {highPain.length
                  ? `${highPain.length} saved ${highPain.length === 1 ? "entry has" : "entries have"} a pain score of 7 or higher. Consider discussing these experiences with a healthcare professional, especially if they are severe, new, or worsening.`
                  : "No saved pain score of 7 or higher was found in your current entries. This does not rule out a health concern."}
              </p>
            </div>
          </article>
        </>
      )}
      <p className="privacy-note">These are summaries of your own entries, not medical conclusions or predictions.</p>
    </>
  );
}

function DoctorReport({ entries }) {
  const [message, setMessage] = useState("");

  function downloadReport() {
    const lines = [
      "HerHealth AI — Symptom Summary",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "This summary contains user-recorded information and is not a diagnosis.",
      `Total entries: ${entries.length}`,
      "",
      ...entries.map((entry, index) => [
        `${index + 1}. ${entry.date} — ${entry.symptom}`,
        `Pain: ${entry.pain ?? "Not recorded"}`,
        `Duration: ${entry.duration || "Not recorded"}`,
        `Bleeding: ${entry.bleeding || "Not recorded"}`,
        `Mood: ${entry.mood || "Not recorded"}`,
        `Fatigue: ${entry.fatigue || "Not recorded"}`,
        `Notes: ${entry.notes || "None"}`,
        "",
      ].join("\n")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "herhealth-symptom-summary.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Your summary was downloaded as a text file.");
  }

  return (
    <>
      <div className="report-heading-row">
        <PageIntro eyebrow="PREPARE FOR YOUR VISIT" title="Doctor-ready report" description="A clear summary of the symptom information you chose to record." />
        <span className="report-icon">▤</span>
      </div>
      <section className="report-paper">
        <Eyebrow>YOUR HEALTH SUMMARY</Eyebrow>
        <h2>Symptom tracking overview</h2>
        <p className="card-subtitle">Generated {new Date().toLocaleDateString()}</p>
        <div className="report-stats">
          <StatCard icon="▤" tone="lavender" label="Total entries" value={entries.length} detail="On this device" />
          <StatCard icon="♡" tone="mint" label="Symptom types" value={new Set(entries.map((e) => e.symptom)).size} detail="Recorded types" />
        </div>
        <h3>Recorded observations</h3>
        {entries.length ? (
          <ul className="report-list">
            {entries.slice(0, 10).map((entry) => (
              <li key={entry.id}>
                <strong>{entry.date}: {entry.symptom}</strong>
                <span>
                  {entry.pain === null || entry.pain === undefined ? "Pain not recorded" : `Pain score ${entry.pain}/10`}
                  {entry.notes ? ` — ${entry.notes}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="screen-description">No symptom entries have been saved yet.</p>
        )}
        <div className="report-disclaimer">
          This report summarises information entered by the user. It is not a diagnosis and does not replace professional medical advice.
        </div>
        <button className="primary-button" type="button" onClick={downloadReport}>
          Download summary
        </button>
        {message && <p className="success-text" role="status">{message}</p>}
      </section>
    </>
  );
}

function CycleCalendar({ entries }) {
  const [month, setMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const recordedDates = new Set(entries.map((entry) => entry.date));

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function shiftMonth(delta) {
    setMonth(new Date(year, monthIndex + delta, 1));
  }

  return (
    <>
      <PageIntro eyebrow="YOUR PERSONAL CALENDAR" title="Calendar & cycle" description="View dates when you recorded symptoms. Cycle predictions are not provided." />
      <section className="calendar-card">
        <div className="calendar-month-row">
          <button type="button" className="calendar-arrow" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
          <h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
          <button type="button" className="calendar-arrow" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
        </div>
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className="calendar-weekday">{day}</span>
          ))}
          {cells.map((day, index) => {
            const dateKey = day
              ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              : "";
            return (
              <span
                key={`${dateKey || "blank"}-${index}`}
                className={`calendar-day ${day && recordedDates.has(dateKey) ? "has-entry" : ""} ${day && dateKey === localDate() ? "is-today" : ""}`}
              >
                {day || ""}
                {day && recordedDates.has(dateKey) && <i aria-label="Entry recorded" />}
              </span>
            );
          })}
        </div>
        <div className="calendar-legend">
          <span><i className="legend-dot purple-dot" /> Entry recorded</span>
          <span><i className="legend-dot today-dot" /> Today</span>
        </div>
      </section>
      <div className="info-card">
        <h3>Cycle context</h3>
        <p>Cycle length and period dates are not inferred from symptom entries. You can discuss your cycle history with a qualified healthcare professional.</p>
      </div>
    </>
  );
}

function Companion() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello. I can help you organise your health questions and explain general health information. I am a demo companion and not a live medical AI.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const suggestions = [
    "Help me summarise my symptoms",
    "What should I discuss with my doctor?",
    "General menstrual health education",
  ];

  function send(text = draft) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      {
        role: "assistant",
        text: "I can help you prepare notes and questions, but this demo does not provide personalised medical assessment. For your next step, record when the symptom started, how severe it feels, how long it lasts, and what changes it. Discuss persistent or concerning symptoms with a qualified clinician. Seek urgent medical care for severe or rapidly worsening symptoms.",
      },
    ]);
    setDraft("");
  }

  return (
    <>
      <PageIntro eyebrow="A SUPPORTIVE SPACE" title="AI health companion" description="Organise your thoughts and prepare questions for a healthcare visit." />
      <div className="chat-card">
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.role}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="suggestion-area">
          <span className="suggestion-label">SUGGESTED QUESTIONS</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="suggestion-chip"
              type="button"
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          className="chat-input-row"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            className="form-control"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a question..."
            aria-label="Message"
            maxLength="1000"
          />
          <button className="chat-send" type="submit" aria-label="Send message">➤</button>
        </form>
      </div>
      <p className="privacy-note">Demo responses are prewritten, not generated by a connected AI model. Do not use this chat for emergencies.</p>
    </>
  );
}

function SafetyEducation() {
  const [tab, setTab] = useState("Safety");

  return (
    <>
      <PageIntro eyebrow="INFORMATION YOU CAN TRUST" title="Safety & education" description="General information to support safer symptom tracking and conversations with a clinician." />
      <div className="filter-row">
        {["Safety", "Education"].map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill ${tab === item ? "selected" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Safety" ? (
        <>
          <article className="safety-alert">
            <span className="alert-symbol">!</span>
            <h2>When to seek medical care</h2>
            <p>Seek urgent medical attention for severe or rapidly worsening symptoms, fainting, difficulty breathing, or heavy bleeding accompanied by weakness or dizziness.</p>
            <p>If you think you may be experiencing a medical emergency, contact your local emergency service.</p>
          </article>
          <InfoResource icon="♡" title="Your symptoms deserve attention" description="Contact a healthcare professional if pain or bleeding is persistent, unusual for you, or interfering with daily life." />
          <InfoResource icon="▤" title="Keep useful notes" description="Record when symptoms started, severity, duration, associated symptoms, and questions you want to ask." />
        </>
      ) : (
        <>
          <InfoResource icon="✧" title="Understanding menstrual cycles" description="Cycle patterns vary. Tracking dates and symptoms can help you discuss your individual experience with a clinician." />
          <InfoResource icon="♡" title="Managing period pain" description="A clinician or pharmacist can help you understand appropriate options based on your circumstances and medical history." />
          <InfoResource icon="☼" title="Whole-person wellbeing" description="Sleep, stress, activity, and other factors may affect how you feel. Tracking them can help guide a healthcare conversation." />
        </>
      )}

      <div className="report-disclaimer">
        HerHealth AI is a symptom-tracking and educational tool. It does not diagnose, treat, or replace a qualified healthcare professional.
      </div>
    </>
  );
}

function InfoResource({ icon, title, description }) {
  return (
    <article className="resource-card">
      <span className="resource-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="tool-arrow">›</span>
    </article>
  );
}

export default App;
