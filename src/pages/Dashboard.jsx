import { useState, useEffect, useRef } from 'react';
import OS from '../components/os/OS';
import './Dashboard.css';

export default function Dashboard() {
  const [phase, setPhase] = useState('welcome'); // 'welcome' | 'fade' | 'os'
  const [chars, setChars] = useState([]);
  const text = 'Welcome to os-A';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setChars(prev => [...prev, text[i]]);
        i++;
      } else {
        clearInterval(interval);
        // Wait 1.5s then fade
        setTimeout(() => setPhase('fade'), 1500);
        // Then show OS
        setTimeout(() => setPhase('os'), 2700);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  if (phase === 'os') return <OS />;

  return (
    <div className={`welcome-screen ${phase === 'fade' ? 'fading' : ''}`}>
      <div className="welcome-text">
        {chars.map((c, i) => (
          <span key={i} className="welcome-char" style={{ animationDelay: `${i * 0}ms` }}>
            {c === ' ' ? '\u00A0' : c}
          </span>
        ))}
        <span className="welcome-cursor" />
      </div>
      <div className="boot-line">os-A v1.0.0 — initializing…</div>
    </div>
  );
}
