import { useState, useEffect } from 'react';
import Taskbar from './Taskbar';
import Window from './Window';
import BraveBrowser from '../apps/BraveBrowser';
import Terminal from '../apps/Terminal';
import Files from '../apps/Files';
import AppCenter from '../apps/AppCenter';
import Settings from '../apps/Settings';
import Notepad from '../apps/Notepad';
import Performance from '../apps/Performance';
import AppGrid from './AppGrid';
import TicTacToe from '../apps/TicTacToe';
import WebFrameApp from '../apps/WebFrameApp';
import VSCodeMock from '../apps/VSCodeMock';
import './OS.css';

export const APP_DEFS = {
  brave:     { title: 'Lion Browser',  emoji: '🦁', component: BraveBrowser, w: 1000, h: 640 },
  terminal:  { title: 'Terminal',      emoji: '⬛', component: Terminal,     w: 720,  h: 460 },
  files:     { title: 'Files',         emoji: '📁', component: Files,        w: 850,  h: 550 },
  notepad:   { title: 'Notepad',       emoji: '📝', component: Notepad,      w: 600,  h: 500 },
  tictactoe: { title: 'Tic Tac Toe',   emoji: '❌', component: TicTacToe,    w: 500,  h: 600 },
  moto:      { title: 'Moto X3M',      emoji: '🏍️', component: (p) => <WebFrameApp src="https://play.famobi.com/moto-x3m-pool-party" {...p}/>, w: 800, h: 600 },
  dice:      { title: 'Deviled Dice',  emoji: '🎲', component: (p) => <WebFrameApp src="https://juicybeast.itch.io/deviled-dice" {...p}/>, w: 800, h: 600 },
  gold:      { title: 'Gold Mine',     emoji: '⛏️', component: (p) => <WebFrameApp src="https://play.famobi.com/gold-mine" {...p}/>, w: 800, h: 600 },
  truck:     { title: 'Endless Truck', emoji: '🚚', component: (p) => <WebFrameApp src="https://play.famobi.com/endless-truck" {...p}/>, w: 800, h: 600 },
  appcenter: { title: 'App Center',    emoji: '🛍️', component: AppCenter,    w: 900,  h: 650 },
  settings:  { title: 'Customize',     emoji: '⚙️', component: Settings,     w: 600,  h: 450 },
  performance: { title: 'Performance', emoji: '📊', component: Performance,  w: 600,  h: 400 },
  vault:     { title: 'Data Vault',    emoji: '🔐', url: 'https://datashare-vault.netlify.app/', w: 1000, h: 700 },
  mail:      { title: 'Data Mail',      emoji: '📧', url: 'https://data-mail.netlify.app/', w: 1000, h: 700 },
  cloud:     { title: 'Data Cloud',     emoji: '☁️', url: 'https://data-cloud.netlify.app/', w: 1000, h: 700 },
  vscode:    { title: 'VS Code',        emoji: '💙', component: VSCodeMock,  w: 900, h: 650 },
};

let _uid = 1;

export default function OS() {
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showAppGrid, setShowAppGrid] = useState(false);
  const [installedApps, setInstalledApps] = useState(['brave', 'terminal', 'files', 'notepad', 'appcenter']);
  const [pinnedApps, setPinnedApps] = useState(['brave', 'terminal', 'files', 'notepad', 'appcenter']);
  const [config, setConfig] = useState({
    dockPosition: 'left',
    theme: 'ubuntu',
    wallpaper: 'ubuntu-default'
  });

  useEffect(() => {
    window.updateOSConfig = (patch) => setConfig(prev => ({ ...prev, ...patch }));
    window.installApp = (appKey) => setInstalledApps(prev => [...new Set([...prev, appKey])]);
  }, []);

  const openApp = (appKey, params = {}) => {
    if (!installedApps.includes(appKey)) return;
    const def = APP_DEFS[appKey];
    if (!def) return;
    
    setShowAppGrid(false);
    const existing = windows.find(w => w.appKey === appKey && !w.params);
    if (existing) {
       updateWindow(existing.id, { minimized: false });
       focusId(existing.id);
       return;
    }

    const id = _uid++;
    setWindows(prev => [
      ...prev,
      {
        id, appKey,
        title: def.title, emoji: def.emoji,
        w: def.w, h: def.h,
        x: 100 + ((id * 30) % 200),
        y: 60 + ((id * 30) % 150),
        minimized: false,
        maximized: false,
        url: def.url,
        params
      },
    ]);
    setActiveId(id);
  };

  const focusId = (id) => {
    setActiveId(id);
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (!win) return prev;
      return [...prev.filter(w => w.id !== id), win];
    });
  };

  const updateWindow = (id, patch) =>
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));

  const closeWindow = (id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const togglePin = (appKey) => {
    setPinnedApps(prev => prev.includes(appKey) ? prev.filter(k => k !== appKey) : [...prev, appKey]);
  };

  const uninstallApp = (appKey) => {
    // Core system apps can't be deleted easily, but let's allow deleting anything for now
    if (['appcenter', 'settings'].includes(appKey)) {
      alert("System apps cannot be uninstalled!");
      return;
    }
    setInstalledApps(prev => prev.filter(k => k !== appKey));
    setPinnedApps(prev => prev.filter(k => k !== appKey));
    setWindows(prev => prev.filter(w => w.appKey !== appKey));
  };

  return (
    <div className={`os-root theme-${config.theme} dock-${config.dockPosition}`}>
      
      <div className="desktop-space">
        {windows.map(win => {
          const def = APP_DEFS[win.appKey];
          const Comp = def?.component;
          
          return (
            <Window
              key={win.id}
              win={win}
              isActive={activeId === win.id}
              onFocus={() => focusId(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => updateWindow(win.id, { minimized: true })}
              onMaximize={() => updateWindow(win.id, { maximized: !win.maximized })}
              onMove={(x, y) => updateWindow(win.id, { x, y })}
            >
              {win.url ? (
                <iframe src={win.url} className="app-iframe-full" title={win.title} />
              ) : (
                Comp && <Comp 
                  openApp={openApp} 
                  params={win.params} 
                  config={config} 
                  setConfig={setConfig} 
                  installedApps={installedApps}
                />
              )}
            </Window>
          );
        })}
      </div>

      <Taskbar
        windows={windows}
        activeId={activeId}
        dockPosition={config.dockPosition}
        config={config}
        installedApps={installedApps}
        pinnedApps={pinnedApps}
        onPinToggle={togglePin}
        appDefs={APP_DEFS}
        onItemClick={(id) => {
          const win = windows.find(w => w.id === id);
          if (win.minimized) {
            updateWindow(id, { minimized: false });
            focusId(id);
          } else if (activeId === id) {
            updateWindow(id, { minimized: true });
          } else {
            focusId(id);
          }
        }}
        onAppLaunch={openApp}
        onShowGrid={() => setShowAppGrid(!showAppGrid)}
      />

      {showAppGrid && (
        <AppGrid 
          apps={Object.entries(APP_DEFS)
            .filter(([key]) => installedApps.includes(key))
            .map(([key, val]) => ({ key, ...val }))} 
          onLaunch={openApp} 
          onClose={() => setShowAppGrid(false)}
          onUninstall={uninstallApp}
        />
      )}
    </div>
  );
}
