import { useState, useEffect } from 'react';
import './Taskbar.css';

export default function Taskbar({ windows, activeId, onItemClick, onAppLaunch, onShowGrid, dockPosition, config, installedApps, pinnedApps, onPinToggle, appDefs }) {
  const [time, setTime] = useState('');
  const [showTray, setShowTray] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showPinSelector, setShowPinSelector] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const today = new Date();
  
  // Combine pinned apps and currently running apps for the dock
  const runningAppKeys = windows.map(w => w.appKey);
  const dockAppKeys = Array.from(new Set([...pinnedApps, ...runningAppKeys]));

  return (
    <>
      {/* Top Bar */}
      <div className="ubuntu-topbar">
        <div className="topbar-left" onClick={onShowGrid}>Activities</div>
        <div className="topbar-center" onClick={() => setShowTray(!showTray)}>{time}</div>
        <div className="topbar-right" onClick={() => setShowSystemMenu(!showSystemMenu)}>
          <span className="top-stat">📶</span>
          <span className="top-stat">🔊</span>
          <span className="top-stat">🔋 85%</span>
        </div>
      </div>

      {/* System Menu Overlay */}
      {showSystemMenu && (
        <div className="sys-menu-overlay" onClick={() => setShowSystemMenu(false)}>
          <div className="sys-menu-card" onClick={e => e.stopPropagation()}>
             {/* ... existing system menu rows ... */}
             <div className="sys-menu-row"><span>🔊</span><input type="range" className="sys-slider" /></div>
             <div className="sys-menu-row"><span>☀️</span><input type="range" className="sys-slider" /></div>
             <div className="sys-menu-sep" />
             <div className="sys-menu-actions">
               <button className="sys-act-btn" onClick={() => { onAppLaunch('settings'); setShowSystemMenu(false); }}>⚙️</button>
               <button className="sys-act-btn danger" onClick={() => window.location.reload()}>⏻</button>
             </div>
          </div>
        </div>
      )}

      {/* Side Dock */}
      <div className={`ubuntu-dock dock-${dockPosition} dock-style-${config?.dockStyle || 'default'}`}>
        <button className="dock-item" title="Show Applications" onClick={onShowGrid}>
          <div className="grid-dots">
            {[...Array(9)].map((_, i) => <span key={i}></span>)}
          </div>
        </button>
        
        {dockAppKeys.map(appKey => {
          const def = appDefs[appKey];
          const activeWin = windows.find(w => w.appKey === appKey);
          return (
            <button
              key={appKey}
              className={`dock-item ${activeWin ? (activeId === activeWin.id ? 'active' : 'running') : ''}`}
              onClick={() => {
                if (activeWin) onItemClick(activeWin.id);
                else onAppLaunch(appKey);
              }}
              title={def?.title}
            >
              {def?.emoji}
              {activeWin && <div className="running-dot" />}
            </button>
          );
        })}

        <button className="dock-item add-btn" title="Pin Apps" onClick={() => setShowPinSelector(!showPinSelector)}>
          +
        </button>
      </div>

      {/* Pin Selector Overlay */}
      {showPinSelector && (
        <div className="pin-overlay" onClick={() => setShowPinSelector(false)}>
          <div className="pin-window" onClick={e => e.stopPropagation()}>
            <h4>Pin to Dock</h4>
            <div className="pin-list">
              {installedApps.map(key => (
                <div key={key} className="pin-item" onClick={() => { onPinToggle(key); setShowPinSelector(false); }}>
                  <span>{appDefs[key]?.emoji}</span>
                  <span>{appDefs[key]?.title}</span>
                  {pinnedApps.includes(key) && <span style={{marginLeft: 'auto', color: '#e95420'}}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
