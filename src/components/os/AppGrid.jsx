import { useState } from 'react';
import './AppGrid.css';

export default function AppGrid({ apps, onLaunch, onClose, onUninstall }) {
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const filteredApps = apps.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleContextMenu = (e, appKey) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, appKey });
  };

  return (
    <div className="app-grid-overlay" onClick={() => { setContextMenu(null); onClose(); }}>
      <div className="app-grid-content" onClick={e => { e.stopPropagation(); setContextMenu(null); }}>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Type to search..." 
            autoFocus 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="apps-container">
          {filteredApps.map(app => (
            <div 
              key={app.key} 
              className="app-grid-item" 
              onClick={() => onLaunch(app.key)}
              onContextMenu={(e) => handleContextMenu(e, app.key)}
            >
              <div className="app-grid-icon">{app.emoji}</div>
              <div className="app-grid-label">{app.title}</div>
            </div>
          ))}
        </div>
        <div className="grid-pagination">
          <span className="dot active"></span>
          <span className="dot"></span>
        </div>
      </div>
      
      {contextMenu && (
        <div 
          className="appgrid-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ctx-item danger" onClick={() => {
            onUninstall(contextMenu.appKey);
            setContextMenu(null);
          }}>Uninstall App</div>
        </div>
      )}
    </div>
  );
}
