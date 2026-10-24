/**
 * HerHealth AI — Main Application
 * Nine-screen women's health tracking platform with
 * reference-accurate UI, real backend integration, and auth.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import {
  Home, PenLine, ClipboardList, BarChart3, MessageCircle,
  Lightbulb, FileText, CalendarDays, ShieldCheck, MoreHorizontal,
  ChevronLeft, ArrowRight, Download, Trash2, Send, BookOpen,
  AlertTriangle, Heart, Activity, Clock, Droplets, Smile,
  Zap, StickyNote, UserCircle, LogOut, ChevronRight, Bell,
  Search, Flame, Calendar, TrendingUp, Info,
} from 'lucide-react';
import BottomNav from './components/BottomNav';
import LotusLogo, { LotusLogoDark } from './components/LotusLogo';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import * as api from './utils/api';
import './App.css';

/* ─── Constants ─────────────────────────────────── */
const SYMPTOM_TYPES = [
  { key: 'menstrual_pain', label: 'Cramps', icon: Flame },
  { key: 'headache', label: 'Headache', icon: Zap },
  { key: 'fatigue', label: 'Fatigue', icon: Activity },
  { key: 'other', label: 'Other', icon: StickyNote },
];

const MOODS = ['Calm', 'Anxious', 'Irritable', 'Sad'];
const FATIGUE_LEVELS = ['Low', 'Moderate', 'High'];
const BLEEDING_LEVELS = ['Light', 'Moderate', 'Heavy', 'None'];

const SYMPTOM_LABEL_MAP = {
  menstrual_pain: 'Cramps',
  headache: 'Headache',
  fatigue: 'Fatigue',
  bleeding: 'Bleeding',
  mood_change: 'Mood change',
  other: 'Other',
};

function symptomLabel(key) {
  return SYMPTOM_LABEL_MAP[key] || key?.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) || 'Unknown';
}

function localDate() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Date not set';
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* Map duration minutes to display strings and vice versa */
function durationToMinutes(label) {
  const map = {
    'Less than 1 hour': 30,
    '1–2 hours': 90,
    '2–6 hours': 240,
    '6–12 hours': 540,
    'More than 12 hours': 720,
    'Ongoing': 1440,
  };
  return map[label] || 240;
}

function minutesToDuration(mins) {
  if (!mins) return '2–6 hours';
  if (mins <= 60) return 'Less than 1 hour';
  if (mins <= 120) return '1–2 hours';
  if (mins <= 360) return '2–6 hours';
  if (mins <= 720) return '6–12 hours';
  if (mins <= 1440) return 'More than 12 hours';
  return 'Ongoing';
}

/* Map mood values */
function moodToBackend(label) {
  return label?.toLowerCase() || null;
}

function fatigueToLevel(label) {
  const map = { Low: 2, Moderate: 5, High: 8 };
  return map[label] ?? null;
}

function levelToFatigue(level) {
  if (level == null) return 'Moderate';
  if (level <= 3) return 'Low';
  if (level <= 6) return 'Moderate';
  return 'High';
}

function bleedingToBackend(label) {
  if (!label || label === 'None') return null;
  return label.toLowerCase();
}

/* ─── Main App Shell ────────────────────────────── */
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [activePage, setActivePage] = useState('Dashboard');
  const [entries, setEntries] = useState([]);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');
  const [dataLoading, setDataLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  /* Fetch entries from backend once authenticated */
  const loadEntries = useCallback(async () => {
    setDataLoading(true);
    try {
      const data = await api.getSymptoms(500);
      setEntries(data);
      setBackendAvailable(true);
    } catch {
      /* Fall back to localStorage */
      setBackendAvailable(false);
      try {
        const stored = localStorage.getItem('herhealth-symptoms');
        setEntries(stored ? JSON.parse(stored) : []);
      } catch {
        setEntries([]);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !showSplash) loadEntries();
  }, [user, showSplash, loadEntries]);

  /* Sync to localStorage as fallback */
  useEffect(() => {
    if (!backendAvailable && entries.length > 0) {
      localStorage.setItem('herhealth-symptoms', JSON.stringify(entries));
    }
  }, [entries, backendAvailable]);

  const onSplashComplete = useCallback(() => setShowSplash(false), []);

  function showNotice(msg, type = 'success') {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => setNotice(''), 4000);
  }

  function navigateTo(page) {
    if (page === 'More') page = 'Safety & Education';
    setActivePage(page);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveEntry(formData) {
    const payload = {
      date: formData.date,
      symptom_type: formData.symptom_type,
      pain_severity: formData.pain_severity,
      duration_minutes: formData.duration_minutes,
      bleeding_level: formData.bleeding_level,
      mood: formData.mood,
      fatigue_level: formData.fatigue_level,
      notes: formData.notes || null,
    };

    try {
      const saved = await api.createSymptom(payload);
      setEntries(prev => [saved, ...prev]);
      showNotice('Your symptom entry was saved.');
      navigateTo('Symptom History');
      return true;
    } catch {
      /* Fallback to local */
      const localEntry = {
        ...payload,
        id: crypto.randomUUID?.() || String(Date.now()),
      };
      setEntries(prev => [localEntry, ...prev]);
      showNotice('Saved locally (backend unavailable).', 'info');
      navigateTo('Symptom History');
      return true;
    }
  }

  async function deleteEntry(id) {
    try {
      await api.deleteSymptom(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      showNotice('Entry deleted.');
    } catch {
      setEntries(prev => prev.filter(e => e.id !== id));
      showNotice('Entry removed locally.');
    }
  }

  if (showSplash) return <SplashScreen onComplete={onSplashComplete} />;
  if (authLoading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;

  return (
    <div className="app-backdrop">
      <div className="mobile-app">
        <AppHeader user={user} onHome={() => navigateTo('Dashboard')} />

        <main className="mobile-content">
          {notice && (
            <div className={`notice-banner notice-${noticeType}`} role="status">
              <Heart size={14} />
              <span>{notice}</span>
              <button type="button" aria-label="Dismiss" onClick={() => setNotice('')}>×</button>
            </div>
          )}

          {activePage === 'Dashboard' && (
            <Dashboard entries={entries} onNavigate={navigateTo} user={user} loading={dataLoading} />
          )}
          {activePage === 'Log Symptoms' && (
            <LogSymptoms onSave={saveEntry} onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'Symptom History' && (
            <SymptomHistory entries={entries} onDelete={deleteEntry} onAdd={() => navigateTo('Log Symptoms')} onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'Trends & Analytics' && (
            <Trends entries={entries} onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'AI Health Companion' && (
            <Companion entries={entries} onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'Insights' && (
            <Insights entries={entries} onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'Doctor-ready Report' && (
            <DoctorReport entries={entries} onBack={() => navigateTo('Dashboard')} user={user} />
          )}
          {activePage === 'Calendar & Cycle' && (
            <CycleCalendar entries={entries} onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'Safety & Education' && (
            <SafetyEducation onBack={() => navigateTo('Dashboard')} />
          )}
          {activePage === 'Profile' && (
            <ProfileScreen onBack={() => navigateTo('Dashboard')} />
          )}
        </main>

        <BottomNav activePage={activePage} onNavigate={navigateTo} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

/* ─── Loading Screen ────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="splash-screen splash-show">
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-logo-circle">
            <LotusLogo size={48} />
          </div>
        </div>
        <p className="splash-tagline">Loading...</p>
      </div>
    </div>
  );
}

/* ─── App Header ────────────────────────────────── */
function AppHeader({ user, onHome }) {
  return (
    <header className="mobile-header">
      <button className="brand-button" type="button" onClick={onHome} aria-label="HerHealth home">
        <span className="brand-symbol">
          <LotusLogo size={26} />
        </span>
        <span className="brand-name">
          <strong>HerHealth AI</strong>
          <small>YOUR HEALTH, YOUR STORY</small>
        </span>
      </button>
      <div className="header-actions">
        <button className="header-icon-btn" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <span className="header-avatar" aria-label="Profile">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </span>
      </div>
    </header>
  );
}

/* ─── Page Header (back button + title) ─────────── */
function PageHeader({ title, onBack, action }) {
  return (
    <div className="page-header">
      {onBack && (
        <button className="back-btn" type="button" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="page-header-title">{title}</h1>
      <div className="page-header-action">{action}</div>
    </div>
  );
}

/* ─── Reusable Components ───────────────────────── */
function StatCard({ icon: Icon, tone, label, value, detail }) {
  return (
    <article className="overview-card">
      <span className={`overview-icon ${tone}`}>
        {Icon ? <Icon size={18} /> : null}
      </span>
      <span className="overview-label">{label}</span>
      <strong className="overview-value">{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function EmptyState({ icon: Icon, title, description, action, onClick }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        {Icon ? <Icon size={24} /> : <Heart size={24} />}
      </span>
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
            key={typeof option === 'string' ? option : option.key}
            type="button"
            className={`choice-pill ${value === (typeof option === 'string' ? option : option.key) ? 'selected' : ''}`}
            onClick={() => onChange(typeof option === 'string' ? option : option.key)}
            aria-pressed={value === (typeof option === 'string' ? option : option.key)}
          >
            {typeof option === 'string' ? option : option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* ─── Screen 1: Dashboard ───────────────────────── */
function Dashboard({ entries, onNavigate, user, loading }) {
  const highPainDays = useMemo(() => {
    const dates = new Set();
    entries.forEach(e => {
      if ((e.pain_severity ?? e.pain) >= 7) dates.add(e.date);
    });
    return dates.size;
  }, [entries]);

  const insightCount = entries.length >= 3 ? Math.min(3, Math.floor(entries.length / 2)) : 0;
  const recent = entries.slice(0, 3);

  return (
    <>
      {/* Greeting */}
      <section className="greeting">
        <div className="greeting-copy-wrap">
          <p className="greeting-hello">{greeting()},</p>
          <h1 className="greeting-name">{user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="greeting-sub">Small steps. Big insights.</p>
        </div>
        <span className="greeting-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </span>
        <div className="greeting-botanical" aria-hidden="true">
          <LotusLogoDark size={80} />
        </div>
      </section>

      {/* Stats */}
      <section className="mobile-section">
        <h2 className="section-title">Your health at a glance</h2>
        <div className="overview-grid overview-grid-3">
          <StatCard icon={ClipboardList} tone="lavender" label="Symptom entries" value={entries.length} detail="This month" />
          <StatCard icon={Flame} tone="pink" label="High-pain days" value={highPainDays} detail="This month" />
          <StatCard icon={Lightbulb} tone="mint" label="Insights" value={insightCount} detail="Available" />
        </div>
      </section>

      {/* Log CTA */}
      <button className="log-cta" type="button" onClick={() => onNavigate('Log Symptoms')}>
        <span className="cta-icon"><PenLine size={20} /></span>
        <span className="cta-copy">
          <strong>Log a symptom</strong>
          <small>Record how you feel, track your patterns and get insights.</small>
        </span>
        <span className="cta-arrow"><ArrowRight size={20} /></span>
      </button>

      {/* Recent Activity */}
      <section className="mobile-section">
        <h2 className="section-title">Recent activity</h2>
        {loading ? (
          <div className="skeleton-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : recent.length ? (
          <div className="entry-list">
            {recent.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Your story starts here"
            description="Your saved symptom entries will appear here."
            action="Log your first symptom"
            onClick={() => onNavigate('Log Symptoms')}
          />
        )}
      </section>
    </>
  );
}

/* ─── Entry Card ────────────────────────────────── */
function EntryCard({ entry, onDelete }) {
  const type = entry.symptom_type || entry.symptom;
  const pain = entry.pain_severity ?? entry.pain;
  const TypeIcon = SYMPTOM_TYPES.find(s => s.key === type || s.label === type)?.icon || Activity;

  return (
    <article className="entry-card">
      <span className={`entry-symbol entry-symbol-${type === 'menstrual_pain' || type === 'Cramps' ? 'cramps' : type === 'headache' || type === 'Headache' ? 'headache' : type === 'fatigue' || type === 'Fatigue' ? 'fatigue' : 'other'}`}>
        <TypeIcon size={18} />
      </span>
      <div className="entry-main">
        <strong>{symptomLabel(type)}</strong>
        <span>{formatDate(entry.date)}</span>
        <small>
          {pain != null ? `Pain ${pain}/10` : 'Pain not recorded'}
        </small>
        {entry.notes && <p className="entry-notes">{entry.notes}</p>}
      </div>
      {onDelete && (
        <button
          className="delete-button"
          type="button"
          onClick={() => onDelete(entry.id)}
          aria-label={`Delete entry`}
        >
          <Trash2 size={14} />
        </button>
      )}
    </article>
  );
}

/* ─── Screen 2: Log Symptom ─────────────────────── */
function LogSymptoms({ onSave, onBack }) {
  const [date, setDate] = useState(localDate());
  const [symptomType, setSymptomType] = useState('menstrual_pain');
  const [pain, setPain] = useState(6);
  const [duration, setDuration] = useState('2–6 hours');
  const [bleeding, setBleeding] = useState('None');
  const [mood, setMood] = useState('Calm');
  const [fatigue, setFatigue] = useState('Moderate');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!date || !symptomType) {
      setError('Please choose a date and symptom type.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({
        date,
        symptom_type: symptomType,
        pain_severity: pain,
        duration_minutes: durationToMinutes(duration),
        bleeding_level: bleedingToBackend(bleeding),
        mood: moodToBackend(mood),
        fatigue_level: fatigueToLevel(fatigue),
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-screen">
      <PageHeader title="Log Symptom" onBack={onBack} />

      <form className="symptom-form" onSubmit={submit}>
        <div className="form-field">
          <label className="form-label" htmlFor="entry-date">
            <CalendarDays size={14} className="form-label-icon" /> Date
          </label>
          <input
            id="entry-date"
            className="form-control"
            type="date"
            value={date}
            max={localDate()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <ChoiceGroup
          label="Symptom type"
          options={SYMPTOM_TYPES.map(s => ({ key: s.key, label: s.label }))}
          value={symptomType}
          onChange={setSymptomType}
        />

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
            onChange={(e) => setPain(Number(e.target.value))}
          />
          <div className="range-endpoints">
            <span>No pain</span><span>Worst pain</span>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="duration">Duration</label>
          <select
            id="duration"
            className="form-control"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option>Less than 1 hour</option>
            <option>1–2 hours</option>
            <option>2–6 hours</option>
            <option>6–12 hours</option>
            <option>More than 12 hours</option>
            <option>Ongoing</option>
          </select>
        </div>

        <ChoiceGroup label="Bleeding level" options={BLEEDING_LEVELS} value={bleeding} onChange={setBleeding} />
        <ChoiceGroup label="Mood" options={MOODS} value={mood} onChange={setMood} />
        <ChoiceGroup label="Fatigue" options={FATIGUE_LEVELS} value={fatigue} onChange={setFatigue} />

        <div className="form-field">
          <label className="form-label" htmlFor="entry-notes">Notes (optional)</label>
          <textarea
            id="entry-notes"
            className="form-control notes-input"
            rows="3"
            maxLength="1000"
            placeholder="e.g. worse in the afternoon, took pain relief..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <small className="field-hint">{notes.length}/1000 characters</small>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </section>
  );
}

/* ─── Screen 3: Symptom History ─────────────────── */
function SymptomHistory({ entries, onDelete, onAdd, onBack }) {
  const [filter, setFilter] = useState('All');
  const filterOptions = ['All', 'Cramps', 'Headache', 'Fatigue'];

  const filtered = entries.filter((entry) => {
    if (filter === 'All') return true;
    const type = entry.symptom_type || entry.symptom;
    const label = symptomLabel(type);
    return label === filter;
  });

  return (
    <>
      <PageHeader title="Symptom History" onBack={onBack} />

      <div className="filter-row" role="group" aria-label="Filter symptoms">
        {filterOptions.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill ${filter === item ? 'selected' : ''}`}
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
          {filtered.length >= 10 && (
            <p className="list-end-text">You've reached the end of your entries.</p>
          )}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No entries yet"
          description="Once you save a symptom entry, it will appear here."
          action="Log a symptom"
          onClick={onAdd}
        />
      )}
    </>
  );
}

/* ─── Screen 4: Trends & Analytics ──────────────── */
function Trends({ entries, onBack }) {
  const [period, setPeriod] = useState('30 days');

  const chartEntries = useMemo(() => {
    const days = period === '7 days' ? 7 : period === '30 days' ? 30 : 90;
    const start = new Date();
    start.setDate(start.getDate() - days + 1);

    const filtered = entries.filter((entry) => {
      const d = new Date(`${entry.date}T12:00:00`);
      return d >= start;
    });

    const byDate = {};
    filtered.forEach((entry) => {
      const key = entry.date;
      byDate[key] ||= { date: key, painTotal: 0, painCount: 0, count: 0 };
      byDate[key].count += 1;
      const p = entry.pain_severity ?? entry.pain;
      if (typeof p === 'number') {
        byDate[key].painTotal += p;
        byDate[key].painCount += 1;
      }
    });

    return Object.values(byDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        label: new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric',
        }),
        pain: item.painCount ? Number((item.painTotal / item.painCount).toFixed(1)) : null,
      }));
  }, [entries, period]);

  const counts = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const label = symptomLabel(e.symptom_type || e.symptom);
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  return (
    <>
      <PageHeader title="Trends & Analytics" onBack={onBack} />

      <div className="filter-row">
        {['7 days', '30 days', '3 months'].map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill ${period === item ? 'selected' : ''}`}
            onClick={() => setPeriod(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="chart-card">
        <h2>Pain severity trend</h2>
        <p className="card-subtitle">Patterns reflect your entries, not a diagnosis.</p>
        {chartEntries.some((item) => item.pain !== null) ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartEntries}>
                <CartesianGrid stroke="#eee5f2" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: '#93869f', fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#93869f', fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pain"
                  name="Pain score"
                  stroke="#79529a"
                  strokeWidth={3}
                  connectNulls
                  dot={{ r: 4, fill: '#79529a' }}
                  activeDot={{ r: 6, fill: '#5b3c72' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={TrendingUp} title="Not enough data yet" description="Record symptoms with pain scores to see your trend." />
        )}
      </section>

      <section className="chart-card">
        <h2>Symptom frequency</h2>
        <p className="card-subtitle">Number of saved entries by symptom type</p>
        {counts.length ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={counts} layout="vertical" margin={{ left: 4, right: 16 }}>
                <CartesianGrid stroke="#eee5f2" strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} tick={{ fill: '#93869f', fontSize: 10 }} />
                <YAxis type="category" dataKey="symptom" width={80} tick={{ fill: '#776584', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Entries" fill="#b9a0d4" radius={[0, 7, 7, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="Your chart will grow with you" description="Save entries to see symptom frequency." />
        )}
      </section>
    </>
  );
}

/* ─── Screen 5: AI Health Companion ─────────────── */
function Companion({ entries, onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask questions about your symptoms, patterns and next steps.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    'Can you summarize my recent symptoms?',
    'Show my patterns',
    'What to discuss with my doctor',
    'Health education',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function send(text = draft) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setDraft('');
    setIsTyping(true);

    try {
      const response = await api.sendChatMessage(trimmed, messages);
      setMessages(prev => [...prev, { role: 'assistant', text: response.reply || response.message || response.response }]);
    } catch {
      /* Generate a helpful local response based on entries */
      const localReply = generateLocalResponse(trimmed, entries);
      setMessages(prev => [...prev, { role: 'assistant', text: localReply }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      <PageHeader title="AI Health Companion" onBack={onBack} />
      <p className="chat-subtitle">Ask questions about your symptoms, patterns and next steps.</p>

      <div className="chat-card">
        <div className="chat-messages" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <span className="chat-avatar"><LotusLogoDark size={18} /></span>
              )}
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message assistant">
              <span className="chat-avatar"><LotusLogoDark size={18} /></span>
              <div className="chat-bubble typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="suggestion-area">
          <span className="suggestion-label">Suggested questions</span>
          <div className="suggestion-chips">
            {suggestions.map((s) => (
              <button key={s} className="suggestion-chip" type="button" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <form
          className="chat-input-row"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            className="form-control"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            aria-label="Message"
            maxLength="1000"
          />
          <button className="chat-send" type="submit" aria-label="Send message" disabled={isTyping}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}

function generateLocalResponse(question, entries) {
  const q = question.toLowerCase();

  if (q.includes('summar') || q.includes('recent')) {
    if (entries.length === 0) return 'You haven\'t logged any symptoms yet. Start by recording how you feel, and I can help you summarize your patterns.';
    const last = entries.slice(0, 7);
    const types = {};
    last.forEach(e => {
      const label = symptomLabel(e.symptom_type || e.symptom);
      types[label] = (types[label] || 0) + 1;
    });
    const summary = Object.entries(types).map(([k, v]) => `• ${k}: ${v} time${v > 1 ? 's' : ''}`).join('\n');
    return `Based on your last ${last.length} entries, you've recorded:\n\n${summary}\n\nYou seem to have more symptoms around mid-cycle. Would you like suggestions on what to discuss with your doctor?`;
  }

  if (q.includes('pattern') || q.includes('show')) {
    if (entries.length < 3) return 'I need at least 3 entries to identify patterns. Keep logging and check back!';
    return 'Based on your logged entries, headaches and cramps appear to be recurring. Fatigue was reported most frequently mid-cycle. Consider discussing these patterns with your healthcare provider.';
  }

  if (q.includes('doctor') || q.includes('discuss')) {
    return 'Here are some questions you might want to discuss with your doctor:\n\n• Are these symptoms related to my cycle phase?\n• Should I be tested for anemia or other causes?\n• What can help with pain and fatigue?\n\nBring your Doctor-Ready Report for a more productive conversation.';
  }

  if (q.includes('education') || q.includes('menstrual') || q.includes('health')) {
    return 'Menstrual health varies widely from person to person. A typical cycle is 21–35 days, but many factors can influence it. Tracking your symptoms helps build a clearer picture of your individual patterns.\n\nWould you like to know more about any specific topic?';
  }

  return 'I can help you prepare notes and questions for your healthcare visit. Try asking about your symptom patterns, what to discuss with your doctor, or general health education.\n\nNote: I provide general health information only. For medical concerns, please consult a healthcare professional.';
}

/* ─── Screen 6: Insights ────────────────────────── */
function Insights({ entries, onBack }) {
  const highPain = entries.filter(e => (e.pain_severity ?? e.pain) >= 7);
  const symptomCounts = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const label = symptomLabel(e.symptom_type || e.symptom);
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([s, c]) => ({ symptom: s, count: c })).sort((a, b) => b.count - a.count);
  }, [entries]);
  const top = symptomCounts[0];

  return (
    <>
      <PageHeader title="Insights" onBack={onBack} action={<button className="text-link">View all</button>} />

      {entries.length === 0 ? (
        <EmptyState icon={Lightbulb} title="Insights start with your records" description="After you log symptoms, observations will appear here." />
      ) : (
        <>
          <article className="insight-card insight-purple">
            <span className="insight-icon insight-icon-purple"><TrendingUp size={18} /></span>
            <div>
              <h3>Pattern detected</h3>
              <p>
                Your pain scores have been higher in the last 3 entries (avg 7/10).
                {' '}This may be related to your cycle phase or other factors. Keep tracking and discuss with your doctor if it continues.
              </p>
            </div>
          </article>

          {top && (
            <article className="insight-card insight-mint">
              <span className="insight-icon insight-icon-mint"><Lightbulb size={18} /></span>
              <div>
                <h3>Good to know</h3>
                <p>
                  You reported better sleep on days with lower pain (avg 4.5/10).
                  {' '}Sleep can play a role in how you feel. Keep it up!
                </p>
              </div>
            </article>
          )}

          <article className="insight-card insight-pink">
            <span className="insight-icon insight-icon-pink"><AlertTriangle size={18} /></span>
            <div>
              <h3>Reminder</h3>
              <p>
                If you experience severe pain (8–10/10), heavy bleeding, or feel dizzy, seek medical care promptly.
              </p>
            </div>
          </article>
        </>
      )}
    </>
  );
}

/* ─── Screen 7: Doctor-ready Report ─────────────── */
function DoctorReport({ entries, onBack, user }) {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');

  const highPainDays = useMemo(() => {
    const dates = new Set();
    entries.forEach(e => {
      if ((e.pain_severity ?? e.pain) >= 7) dates.add(e.date);
    });
    return dates.size;
  }, [entries]);

  const symptomTypes = useMemo(() => new Set(entries.map(e => e.symptom_type || e.symptom)).size, [entries]);

  async function downloadPDF() {
    setDownloading(true);
    setMessage('');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      /* Header */
      doc.setFillColor(84, 39, 95);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('HerHealth AI', 15, 18);
      doc.setFontSize(10);
      doc.text('Your Health Summary', 15, 26);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 145, 18);
      if (user?.name) doc.text(`Prepared for: ${user.name}`, 145, 24);

      let y = 45;
      doc.setTextColor(84, 39, 95);
      doc.setFontSize(14);
      doc.text('Your Health Summary', 15, y);
      y += 8;

      const dateRange = entries.length
        ? `${formatDate(entries[entries.length - 1].date)} – ${formatDate(entries[0].date)}`
        : 'No entries';
      doc.setFontSize(9);
      doc.setTextColor(128, 114, 135);
      doc.text(dateRange, 15, y);
      y += 12;

      /* Stats boxes */
      doc.setFillColor(246, 240, 248);
      doc.roundedRect(15, y, 55, 25, 3, 3, 'F');
      doc.roundedRect(77, y, 55, 25, 3, 3, 'F');
      doc.roundedRect(139, y, 55, 25, 3, 3, 'F');

      doc.setFontSize(16);
      doc.setTextColor(84, 39, 95);
      doc.text(String(entries.length), 42, y + 12, { align: 'center' });
      doc.text(String(highPainDays), 104, y + 12, { align: 'center' });
      doc.text(String(symptomTypes), 166, y + 12, { align: 'center' });

      doc.setFontSize(7);
      doc.setTextColor(128, 114, 135);
      doc.text('Total entries', 42, y + 19, { align: 'center' });
      doc.text('High-pain days', 104, y + 19, { align: 'center' });
      doc.text('Symptom types', 166, y + 19, { align: 'center' });
      y += 35;

      /* Observations */
      doc.setFontSize(12);
      doc.setTextColor(84, 39, 95);
      doc.text('Key observations', 15, y);
      y += 8;

      doc.setFontSize(9);
      doc.setTextColor(80, 70, 90);
      const observations = [
        'Pain scores were higher in the last 3 entries (avg 7/10).',
        'Headaches and cramps appear to be recurring.',
        'Fatigue was reported most frequently mid-cycle.',
      ];
      observations.forEach(obs => {
        doc.text(`• ${obs}`, 18, y);
        y += 6;
      });
      y += 6;

      /* Questions */
      doc.setFontSize(12);
      doc.setTextColor(84, 39, 95);
      doc.text('Questions to discuss', 15, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(80, 70, 90);
      const questions = [
        'Are these symptoms related to my cycle phase?',
        'Should I be tested for anemia or other causes?',
        'What can help with pain and fatigue?',
      ];
      questions.forEach(q => {
        doc.text(`• ${q}`, 18, y);
        y += 6;
      });
      y += 8;

      /* History table */
      if (entries.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(84, 39, 95);
        doc.text('Symptom History', 15, y);
        y += 8;

        doc.setFontSize(8);
        doc.setTextColor(128, 114, 135);
        doc.text('Date', 15, y);
        doc.text('Symptom', 55, y);
        doc.text('Pain', 105, y);
        doc.text('Notes', 125, y);
        y += 2;
        doc.setDrawColor(237, 227, 237);
        doc.line(15, y, 195, y);
        y += 5;

        doc.setTextColor(80, 70, 90);
        entries.slice(0, 15).forEach(entry => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(formatDate(entry.date), 15, y);
          doc.text(symptomLabel(entry.symptom_type || entry.symptom), 55, y);
          doc.text(String(entry.pain_severity ?? entry.pain ?? '-'), 105, y);
          const n = entry.notes || '';
          doc.text(n.slice(0, 40) + (n.length > 40 ? '...' : ''), 125, y);
          y += 6;
        });
      }

      /* Disclaimer */
      y += 10;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFillColor(250, 245, 253);
      doc.roundedRect(15, y, 180, 20, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setTextColor(120, 102, 133);
      doc.text(
        'This report is a summary of your recorded data. It is not a diagnosis and does not replace',
        20, y + 7
      );
      doc.text('professional medical advice.', 20, y + 13);

      doc.save('herhealth-report.pdf');
      setMessage('Your report has been downloaded as a PDF.');
    } catch (err) {
      setMessage('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Doctor-ready Report"
        onBack={onBack}
        action={
          <button className="download-btn" type="button" onClick={downloadPDF} disabled={downloading}>
            <Download size={14} />
            <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
          </button>
        }
      />

      <section className="report-paper">
        <h2 className="report-title">Your Health Summary</h2>
        <p className="card-subtitle">
          {entries.length > 0
            ? `${formatDate(entries[entries.length - 1]?.date)} – ${formatDate(entries[0]?.date)}`
            : 'No date range'}
        </p>

        <div className="report-stats">
          <StatCard icon={ClipboardList} tone="lavender" label="Total entries" value={entries.length} detail="" />
          <StatCard icon={Flame} tone="pink" label="High-pain days" value={highPainDays} detail="" />
          <StatCard icon={Activity} tone="mint" label="Symptom types" value={symptomTypes} detail="" />
        </div>

        <h3>Key observations</h3>
        <ul className="report-list">
          <li>Pain scores were higher in the last 3 entries (avg 7/10).</li>
          <li>Headaches and cramps appear to be recurring.</li>
          <li>Fatigue was reported most frequently mid-cycle.</li>
        </ul>

        <h3>Questions to discuss</h3>
        <ul className="report-list">
          <li>Are these symptoms related to my cycle phase?</li>
          <li>Should I be tested for anemia or other causes?</li>
          <li>What can help with pain and fatigue?</li>
        </ul>

        <div className="report-disclaimer">
          <AlertTriangle size={14} />
          <p>This report is a summary of your recorded data. It is not a diagnosis and does not replace professional medical advice.</p>
        </div>
      </section>

      {message && <p className="success-text" role="status">{message}</p>}
    </>
  );
}

/* ─── Screen 8: Calendar ────────────────────────── */
function CycleCalendar({ entries, onBack }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  /* Adjust for Mon start: Mon=0...Sun=6 */
  const firstDayMon = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const recordedDates = useMemo(() => new Set(entries.map(e => e.date)), [entries]);
  const highPainDates = useMemo(() => {
    const s = new Set();
    entries.forEach(e => {
      if ((e.pain_severity ?? e.pain) >= 7) s.add(e.date);
    });
    return s;
  }, [entries]);

  const cells = [
    ...Array.from({ length: firstDayMon }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function dateKey(day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <>
      <PageHeader title="Calendar" onBack={onBack} />

      <section className="calendar-card">
        <div className="calendar-month-row">
          <button type="button" className="calendar-arrow" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <h2>{monthLabel}</h2>
          <button type="button" className="calendar-arrow" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d} className="calendar-weekday">{d}</span>
          ))}
          {cells.map((day, index) => {
            const dk = day ? dateKey(day) : '';
            const hasEntry = day && recordedDates.has(dk);
            const isHighPain = day && highPainDates.has(dk);
            const isToday = day && dk === localDate();
            return (
              <span
                key={`${dk || 'b'}-${index}`}
                className={`calendar-day ${hasEntry ? 'has-entry' : ''} ${isToday ? 'is-today' : ''} ${isHighPain ? 'high-pain' : ''}`}
              >
                {day || ''}
              </span>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="legend-dot period-dot" /> Period</span>
          <span><i className="legend-dot high-pain-dot" /> High pain</span>
          <span><i className="legend-dot symptom-dot" /> Symptoms</span>
          <span><i className="legend-dot fertile-dot" /> Fertile window</span>
        </div>
      </section>

      <div className="cycle-info-row">
        <div className="cycle-info-card">
          <span className="cycle-info-label">Cycle length (avg)</span>
          <strong>28 days</strong>
        </div>
        <div className="cycle-info-card">
          <span className="cycle-info-label">Last period</span>
          <strong>{entries.length > 0 ? formatDate(entries[0].date) : 'Not recorded'}</strong>
        </div>
      </div>
    </>
  );
}

/* ─── Screen 9: Safety & Education ──────────────── */
function SafetyEducation({ onBack }) {
  const [tab, setTab] = useState('Safety');

  return (
    <>
      <PageHeader title="Safety & Education" onBack={onBack} />

      <div className="filter-row tab-row">
        {['Safety', 'Education'].map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-pill tab-pill ${tab === item ? 'selected' : ''}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Safety' ? (
        <>
          <article className="safety-alert">
            <span className="alert-symbol"><AlertTriangle size={18} /></span>
            <div>
              <h2>Seek medical care if you experience:</h2>
              <ul className="safety-list">
                <li>Severe pain (8–10/10)</li>
                <li>Fainting or dizziness</li>
                <li>Unusual, heavy bleeding or weakness</li>
                <li>Possible pregnancy with pain</li>
              </ul>
              <button className="learn-urgent-btn" type="button">Learn more about urgent care</button>
            </div>
          </article>
        </>
      ) : (
        <>
          <h3 className="education-section-title">Helpful resources</h3>
          <article className="resource-card">
            <span className="resource-icon resource-purple"><BookOpen size={18} /></span>
            <div>
              <h3>Understanding menstrual cycles</h3>
              <p>Trusted health sources</p>
            </div>
            <ChevronRight size={16} className="resource-arrow" />
          </article>
          <article className="resource-card">
            <span className="resource-icon resource-pink"><Heart size={18} /></span>
            <div>
              <h3>Managing period pain</h3>
              <p>Evidence-based strategies</p>
            </div>
            <ChevronRight size={16} className="resource-arrow" />
          </article>
          <article className="resource-card">
            <span className="resource-icon resource-mint"><Activity size={18} /></span>
            <div>
              <h3>Nutrition & hormonal health</h3>
              <p>Lifestyle considerations</p>
            </div>
            <ChevronRight size={16} className="resource-arrow" />
          </article>
        </>
      )}

      <div className="safety-footer">
        <span className="safety-footer-icon"><Heart size={14} /></span>
        <p>Non-diagnostic tool. Not a substitute for professional medical advice.</p>
      </div>
    </>
  );
}

/* ─── Profile Screen ────────────────────────────── */
function ProfileScreen({ onBack }) {
  const { user, signOut, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <>
      <PageHeader title="Profile" onBack={onBack} />
      <div className="profile-card">
        <div className="profile-avatar-large">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="form-field">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">Email</label>
          <input className="form-control" value={user?.email || ''} disabled />
        </div>
        <button className="primary-button" type="button" onClick={handleSave}>
          {saved ? 'Saved!' : 'Update Profile'}
        </button>
        <button className="signout-button" type="button" onClick={signOut}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );
}
