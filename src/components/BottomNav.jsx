
const tabs = [
  { id: "Dashboard", label: "Home", icon: "⌂" },
  { id: "Log Symptoms", label: "Log", icon: "↻" },
  { id: "Symptom History", label: "History", icon: "▤" },
  { id: "Insights", label: "Insights", icon: "✧" },
  { id: "AI Health Companion", label: "AI Chat", icon: "♡" },
  { id: "More", label: "More", icon: "☰" },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav-item ${
            activePage === tab.id ||
            (tab.id === "More" &&
              [
                "Trends & Analytics",
                "Doctor-ready Report",
                "Calendar & Cycle",
                "Safety & Education",
              ].includes(activePage))
              ? "active"
              : ""
          }`}
          onClick={() => {
            if (tab.id === "More") {
              onNavigate("More");
            } else {
              onNavigate(tab.id);
            }
          }}
          aria-current={activePage === tab.id ? "page" : undefined}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
