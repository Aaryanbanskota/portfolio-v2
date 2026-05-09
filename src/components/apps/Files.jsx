import { useState, useEffect } from 'react';
import './Files.css';

export const defaultFS = {
  '/': [
    { name: 'home',  type: 'dir' },
    { name: 'etc',   type: 'dir' },
  ],
  '/home': [
    { name: 'user', type: 'dir' },
  ],
  '/home/user': [
    { name: 'Documents',  type: 'dir' },
    { name: 'Downloads',  type: 'dir' },
    { name: 'portfolio',  type: 'dir' },
    { name: 'readme.txt', type: 'txt',  size: '1 KB', content: 'Welcome to os-A! This is a text file.' },
    { name: 'todo.txt',   type: 'txt',  size: '2 KB', content: '- Finish OS\n- Add Notepad\n- Fixed iframe scaling' },
  ],
  '/home/user/Documents': [
    { name: 'report.txt', type: 'txt', size: '12 KB', content: 'This is a long report about the OS performance...' },
    { name: 'portfolio', type: 'dir' }
  ],
  '/home/user/Downloads': [],
  '/home/user/portfolio': [],
  '/home/user/Documents/portfolio': [],
  '/etc': [
    { name: 'hosts.txt', type: 'txt', size: '1 KB', content: '127.0.0.1 localhost' },
  ],
};

export const getFS = () => {
  try {
    const stored = localStorage.getItem('lion_os_fs');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(defaultFS));
};

export const saveFS = (newFS) => {
  localStorage.setItem('lion_os_fs', JSON.stringify(newFS));
  window.dispatchEvent(new Event('fs_updated'));
};

export const saveFile = (fullPath, content, type = 'txt') => {
  const parts = fullPath.split('/');
  const name = parts.pop();
  let path = parts.join('/') || '/';
  
  const fs = getFS();
  if (!fs[path]) fs[path] = [];
  const existing = fs[path].find(f => f.name === name);
  if (existing) {
    existing.content = content;
    existing.size = Math.ceil(content.length / 1024) + ' KB';
    existing.type = type;
  } else {
    fs[path].push({ name, type, size: Math.max(1, Math.ceil(content.length / 1024)) + ' KB', content });
  }
  saveFS(fs);
};

const ICON = {
  dir: '📁',
  txt: '📄',
  app: '📦',
};

export default function Files({ openApp, installedApps }) {
  const [cwd, setCwd]           = useState('/home/user');
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');
  const [fsState, setFsState]   = useState(getFS());
  const [installerPrompt, setInstallerPrompt] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const onUpdate = () => setFsState(getFS());
    window.addEventListener('fs_updated', onUpdate);
    return () => window.removeEventListener('fs_updated', onUpdate);
  }, []);

  const crumbs = ['/', ...cwd.split('/').filter(Boolean)];

  const navigateCrumb = (idx) => {
    if (idx === 0) { setCwd('/'); setSelected(null); return; }
    const path = '/' + crumbs.slice(1, idx + 1).join('/');
    setCwd(path);
    setSelected(null);
  };

  const entries = (fsState[cwd] || []).filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const open = (entry) => {
    if (entry.name === 'portfolio' && entry.type === 'dir' && (cwd === '/home/user' || cwd === '/home/user/Documents')) {
      if (installedApps && installedApps.includes('vscode')) {
        openApp('vscode');
      } else {
        alert("Please download VS Code from the App Center to open this project.");
      }
      return;
    }

    if (entry.type === 'dir') {
      const next = cwd === '/' ? `/${entry.name}` : `${cwd}/${entry.name}`;
      if (fsState[next] !== undefined) { setCwd(next); setSelected(null); }
    } else if (entry.name.endsWith('.app') || entry.type === 'app') {
      try {
        const data = JSON.parse(entry.content);
        setInstallerPrompt(data.appId);
      } catch(e) {
        alert("Corrupted installer file.");
      }
    } else if (entry.type === 'txt') {
      openApp('notepad', { content: entry.content });
    }
  };

  const handleInstallChoice = (choice) => {
    if (choice === 'install') {
      window.installApp(installerPrompt);
      alert('App added to System GUI! Check the Activities menu.');
    } else if (choice === 'open') {
      openApp(installerPrompt);
    }
    setInstallerPrompt(null);
  };

  const handleContextMenu = (e, entry) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entry });
  };

  const deleteEntry = (entry) => {
    const fs = getFS();
    fs[cwd] = fs[cwd].filter(e => e.name !== entry.name);
    saveFS(fs);
    setContextMenu(null);
  };

  return (
    <div className="files" style={{ position: 'relative' }} onClick={() => setContextMenu(null)}>
      {installerPrompt && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#252525', padding: '20px', borderRadius: '10px', color: 'white', maxWidth: '300px', textAlign: 'center', border: '1px solid #444', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>App Installer</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#ccc' }}>Do you want to add <strong>{installerPrompt}</strong> to the System GUI, or open it directly?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => handleInstallChoice('open')} style={{ padding: '8px 12px', background: '#444', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>Open</button>
              <button onClick={() => handleInstallChoice('install')} style={{ padding: '8px 12px', background: '#e95420', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>Add to System</button>
            </div>
            <button onClick={() => setInstallerPrompt(null)} style={{ marginTop: '15px', padding: '5px 10px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {contextMenu && (
        <div 
          className="files-context-menu" 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ctx-item" onClick={() => { open(contextMenu.entry); setContextMenu(null); }}>Open</div>
          <div className="ctx-item has-submenu">
            Open With <span>▶</span>
            <div className="ctx-submenu">
              <div className="ctx-item" onClick={() => { openApp('vscode'); setContextMenu(null); }}>VS Code</div>
              <div className="ctx-item" onClick={() => { openApp('terminal'); setContextMenu(null); }}>Terminal</div>
              {contextMenu.entry.type === 'dir' && (
                <div className="ctx-item" onClick={() => { 
                  const next = cwd === '/' ? `/${contextMenu.entry.name}` : `${cwd}/${contextMenu.entry.name}`;
                  setCwd(next);
                  setContextMenu(null); 
                }}>Folder View</div>
              )}
            </div>
          </div>
          <div className="ctx-item danger" onClick={() => deleteEntry(contextMenu.entry)}>Delete</div>
        </div>
      )}

      <div className="files-sidebar">
        <div className="sidebar-section">FAVOURITES</div>
        {[
          { label: 'Home',      path: '/home/user' },
          { label: 'Documents', path: '/home/user/Documents' },
          { label: 'Downloads', path: '/home/user/Downloads' },
        ].map(({ label, path }) => (
          <div
            key={label}
            className={`sidebar-item ${cwd === path ? 'active' : ''}`}
            onClick={() => { setCwd(path); setSelected(null); }}
          >
            {ICON.dir} {label}
          </div>
        ))}
      </div>

      <div className="files-main">
        <div className="files-toolbar">
          <button className="files-nav-btn" onClick={() => {
            const parts = cwd.split('/').filter(Boolean);
            parts.pop();
            setCwd('/' + parts.join('/') || '/');
            setSelected(null);
          }} disabled={cwd === '/'}>←</button>

          <div className="breadcrumbs">
            {crumbs.map((part, i) => (
              <span key={i}>
                <span className="crumb" onClick={() => navigateCrumb(i)}>{i === 0 ? '/' : part}</span>
                {i < crumbs.length - 1 && i > 0 && <span className="crumb-sep">/</span>}
              </span>
            ))}
          </div>

          <input className="files-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="files-grid">
          {entries.map(entry => (
            <div
              key={entry.name}
              className={`file-item ${selected === entry.name ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); setSelected(entry.name); }}
              onDoubleClick={() => open(entry)}
              onContextMenu={(e) => handleContextMenu(e, entry)}
            >
              <div className="file-icon">{ICON[entry.type] || '📄'}</div>
              <span className="file-name">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
