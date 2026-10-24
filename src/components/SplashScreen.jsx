/**
 * HerHealth AI — Splash Screen
 * Animated lotus logo reveal with branding.
 */
import { useEffect, useState } from 'react';
import LotusLogo from './LotusLogo';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); /* enter → show → exit */

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-bg-circle" />
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-logo-circle">
            <LotusLogo size={52} />
          </div>
        </div>
        <h1 className="splash-title">HerHealth AI</h1>
        <p className="splash-tagline">Your symptoms. Your patterns. Your voice.</p>
      </div>
      <div className="splash-botanical splash-botanical-left" />
      <div className="splash-botanical splash-botanical-right" />
    </div>
  );
}
