/**
 * HerHealth AI — Bottom Navigation Bar
 * Fixed bottom tab bar with Lucide icons matching the reference.
 * "More" opens a menu overlay for additional pages.
 */
import { useState } from 'react';
import {
  Home, PenLine, ClipboardList, Lightbulb, MessageCircle,
  MoreHorizontal, BarChart3, FileText, CalendarDays, ShieldCheck,
  UserCircle, X,
} from 'lucide-react';

const tabs = [
  { id: 'Dashboard', label: 'Home', Icon: Home },
  { id: 'Log Symptoms', label: 'Log', Icon: PenLine },
  { id: 'Symptom History', label: 'History', Icon: ClipboardList },
  { id: 'Insights', label: 'Insights', Icon: Lightbulb },
  { id: 'AI Health Companion', label: 'AI Chat', Icon: MessageCircle },
  { id: 'More', label: 'More', Icon: MoreHorizontal },
];

const morePages = [
  { id: 'Trends & Analytics', label: 'Trends & Analytics', Icon: BarChart3 },
  { id: 'Doctor-ready Report', label: 'Doctor-ready Report', Icon: FileText },
  { id: 'Calendar & Cycle', label: 'Calendar', Icon: CalendarDays },
  { id: 'Safety & Education', label: 'Safety & Education', Icon: ShieldCheck },
  { id: 'Profile', label: 'Profile', Icon: UserCircle },
];

const morePageIds = morePages.map(p => p.id);

export default function BottomNav({ activePage, onNavigate }) {
  const [showMore, setShowMore] = useState(false);

  function handleMoreClick(id) {
    setShowMore(false);
    onNavigate(id);
  }

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="more-overlay" onClick={() => setShowMore(false)}>
          <div className="more-menu" onClick={(e) => e.stopPropagation()}>
            <div className="more-menu-header">
              <h3>More</h3>
              <button className="more-close" type="button" onClick={() => setShowMore(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            {morePages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={`more-menu-item ${activePage === page.id ? 'active' : ''}`}
                onClick={() => handleMoreClick(page.id)}
              >
                <span className="more-menu-icon"><page.Icon size={18} /></span>
                <span>{page.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => {
          const isActive =
            activePage === tab.id ||
            (tab.id === 'More' && morePageIds.includes(activePage));

          return (
            <button
              key={tab.id}
              type="button"
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (tab.id === 'More') {
                  setShowMore(!showMore);
                } else {
                  setShowMore(false);
                  onNavigate(tab.id);
                }
              }}
              aria-current={activePage === tab.id ? 'page' : undefined}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                <tab.Icon size={20} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
